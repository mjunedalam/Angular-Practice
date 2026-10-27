#!/usr/bin/env swift
// macOS only. Run with Apple's Swift toolchain (Xcode Command Line Tools):
//   swift chrome_to_iphone.swift --check
//   swift chrome_to_iphone.swift --once
//   nohup swift chrome_to_iphone.swift > "$HOME/Library/Logs/chrome-to-iphone.log" 2>&1 &
// Alternatively, compile with xcrun swiftc and keep the executable at a fixed path.
// Stop with the camera menu in the menu bar, Ctrl+C, or kill <printed PID>.
// AirDrop uses a visible picker. Automatic selection depends on its accessibility
// layout; this is a best-effort desktop automation, not a headless AirDrop API.
// Requires an unlocked, logged-in Mac, Chrome, and a nearby discoverable iPhone.

import AppKit
import ApplicationServices
import Darwin

struct Options {
    var iphone = "Mohammad Juned's iPhone"
    var interval: TimeInterval = 30
    var once = false
    var check = false

    static let help = """
    Capture the frontmost Google Chrome window and send it through AirDrop.

    Usage: chrome-to-iphone [--iphone NAME] [--interval SECONDS] [--once] [--check]
      --iphone NAME       Exact name in the AirDrop picker (default: Mohammad Juned's iPhone)
      --interval SECONDS  Delay after each completed transfer (default: 30; minimum: 5)
      --once              Capture/share once, then exit; Chrome must be frontmost
      --check             Report permissions without capturing or sending anything
      --help              Show this help

    Enable Screen Recording and Accessibility for the executable or launching
    terminal in System Settings > Privacy & Security, then restart the command.
    Run --once in the foreground first and switch to Chrome within 5 seconds.
    Keep Wi-Fi, Bluetooth and AirDrop enabled on both devices. Using the same
    Apple Account on both devices allows the iPhone to accept automatically.

    Only the visible tab in the frontmost Chrome window is captured. Other apps,
    minimized windows and background tabs are skipped. The picker may take focus.
    No transfer is retried automatically: an error or 60-second timeout stops
    the script. A screenshot is removed locally when the attempt finishes.
    Stop from the camera menu, with Ctrl+C, or with kill <PID>.
    """

    init(_ arguments: [String]) throws {
        var index = 0
        while index < arguments.count {
            switch arguments[index] {
            case "--help", "-h": print(Self.help); exit(0)
            case "--once": once = true
            case "--check": check = true
            case "--iphone", "--interval":
                let flag = arguments[index]
                index += 1
                guard index < arguments.count else { throw Failure("Missing value for \(flag)") }
                if flag == "--iphone" {
                    iphone = arguments[index].trimmingCharacters(in: .whitespacesAndNewlines)
                    guard !iphone.isEmpty else { throw Failure("iPhone name cannot be empty") }
                } else {
                    guard let value = Double(arguments[index]), value.isFinite, value >= 5,
                          value <= 86400 else { throw Failure("Interval must be between 5 and 86400 seconds") }
                    interval = value
                }
            default: throw Failure("Unknown argument: \(arguments[index])")
            }
            index += 1
        }
    }
}

struct Failure: LocalizedError {
    let errorDescription: String?
    init(_ message: String) { errorDescription = message }
}

func log(_ message: String) {
    print("[\(ISO8601DateFormatter().string(from: Date()))] \(message)")
    fflush(stdout)
}

func attribute(_ element: AXUIElement, _ name: String) -> CFTypeRef? {
    var value: CFTypeRef?
    guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
    return value
}

func normalized(_ name: String) -> String {
    name.precomposedStringWithCanonicalMapping
        .replacingOccurrences(of: "’", with: "'")
        .trimmingCharacters(in: .whitespacesAndNewlines)
}

// Search only this utility's share sheet, never unrelated Finder/app windows.
// Match a complete label and press its nearest button/cell; never guess coordinates.
func recipientButtons(in root: AXUIElement, named name: String) -> [AXUIElement] {
    var results: [AXUIElement] = []
    var budget = 1500
    func visit(_ node: AXUIElement, ancestors: [AXUIElement], depth: Int) {
        guard depth < 24, budget > 0 else { return }
        budget -= 1
        let matches = [kAXTitleAttribute, kAXDescriptionAttribute, kAXValueAttribute].contains {
            guard let label = attribute(node, $0) as? String else { return false }
            return normalized(label) == normalized(name)
        }
        if matches {
            for candidate in ([node] + ancestors.reversed()).prefix(4) {
                let role = attribute(candidate, kAXRoleAttribute) as? String
                guard [kAXButtonRole, kAXCellRole, kAXRowRole].contains(role ?? "") else { continue }
                var actions: CFArray?
                guard AXUIElementCopyActionNames(candidate, &actions) == .success,
                      (actions as? [String])?.contains(kAXPressAction) == true else { continue }
                if !results.contains(where: { CFEqual($0, candidate) }) { results.append(candidate) }
                break
            }
        }
        for child in attribute(node, kAXChildrenAttribute) as? [AXUIElement] ?? [] {
            visit(child, ancestors: ancestors + [node], depth: depth + 1)
        }
    }
    visit(root, ancestors: [], depth: 0)
    return results
}

final class CaptureAgent: NSObject, NSApplicationDelegate, NSSharingServiceDelegate {
    let options: Options
    let directory: URL
    let lockFD: Int32
    var tickTimer: Timer?
    var pickerTimer: Timer?
    var signals: [DispatchSourceSignal] = []
    var statusItem: NSStatusItem?
    var service: NSSharingService?
    var screenshot: URL?
    var chrome: NSRunningApplication?
    var lastSkip: String?
    var exiting = false
    let host = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 340, height: 110),
                        styleMask: [.titled], backing: .buffered, defer: false)

    init(options: Options) throws {
        self.options = options
        let cache = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ChromeAirDrop", isDirectory: true)
        try FileManager.default.createDirectory(at: cache, withIntermediateDirectories: true,
                                               attributes: [.posixPermissions: 0o700])
        lockFD = open(cache.appendingPathComponent("running.lock").path, O_CREAT | O_RDWR, 0o600)
        guard lockFD >= 0 else { throw Failure("Cannot open the instance lock") }
        guard flock(lockFD, LOCK_EX | LOCK_NB) == 0 else {
            close(lockFD)
            throw Failure("Another copy is already running. Stop it from the camera menu first.")
        }
        directory = FileManager.default.temporaryDirectory
            .appendingPathComponent("chrome-airdrop-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: false,
                                               attributes: [.posixPermissions: 0o700])
        super.init()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        host.title = "Chrome AirDrop"
        host.center()
        let label = NSTextField(labelWithString: "Waiting for the AirDrop transfer…")
        label.frame = NSRect(x: 22, y: 42, width: 300, height: 24)
        host.contentView?.addSubview(label)
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        item.button?.image = NSImage(systemSymbolName: "camera", accessibilityDescription: "Chrome AirDrop running")
        item.button?.toolTip = "Chrome screenshots → \(options.iphone)"
        let menu = NSMenu()
        menu.addItem(withTitle: "Chrome → iPhone (\(Int(options.interval))s)", action: nil, keyEquivalent: "")
        let stop = menu.addItem(withTitle: "Stop Chrome AirDrop", action: #selector(stopFromMenu), keyEquivalent: "q")
        stop.target = self
        item.menu = menu
        statusItem = item
        for number in [SIGINT, SIGTERM] {
            signal(number, SIG_IGN)
            let source = DispatchSource.makeSignalSource(signal: number, queue: .main)
            source.setEventHandler { [weak self] in self?.finish(0, "Stopped") }
            source.resume()
            signals.append(source)
        }
        log("Running PID \(getpid()); recipient: \(options.iphone). Switch to Chrome within 5 seconds.")
        schedule(after: 5)
    }

    func schedule(after delay: TimeInterval) {
        tickTimer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in self?.capture() }
    }

    func skip(_ reason: String) {
        if options.once { finish(1, reason); return }
        if lastSkip != reason { log(reason); lastSkip = reason }
        schedule(after: options.interval)
    }

    func capture() {
        guard service == nil, !exiting else { return }
        guard let app = NSWorkspace.shared.frontmostApplication,
              app.bundleIdentifier == "com.google.Chrome" else { skip("Waiting for Chrome to be frontmost"); return }
        guard let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID)
                as? [[String: Any]],
              let window = windows.first(where: {
                  ($0[kCGWindowOwnerPID as String] as? Int32) == app.processIdentifier &&
                  ($0[kCGWindowLayer as String] as? Int) == 0
              }), let id = window[kCGWindowNumber as String] as? UInt32 else {
            skip("Waiting for a visible Chrome window"); return
        }
        lastSkip = nil
        chrome = app
        let file = directory.appendingPathComponent("Chrome-\(UUID().uuidString).png")
        screenshot = file
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/sbin/screencapture")
        process.arguments = ["-x", "-o", "-l", String(id), file.path]
        do {
            try process.run()
            process.waitUntilExit()
            guard process.terminationStatus == 0,
                  let size = try FileManager.default.attributesOfItem(atPath: file.path)[.size] as? NSNumber,
                  size.intValue > 0 else { throw Failure("Screenshot failed. Check Screen Recording permission.") }
            guard let share = NSSharingService(named: .sendViaAirDrop), share.canPerform(withItems: [file]) else {
                throw Failure("AirDrop is unavailable on this Mac")
            }
            service = share
            share.delegate = self
            host.makeKeyAndOrderFront(nil)
            NSApp.activate(ignoringOtherApps: true)
            share.perform(withItems: [file])
            watchPicker()
        } catch { finish(1, error.localizedDescription) }
    }

    func watchPicker() {
        let deadline = ProcessInfo.processInfo.systemUptime + 60
        var pressed = false
        var reported = false
        pickerTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self = self, self.service != nil else { return }
            if ProcessInfo.processInfo.systemUptime >= deadline {
                self.finish(1, "AirDrop timed out. Check the iPhone is discoverable and its picker name matches. Delivery is unconfirmed.")
                return
            }
            guard !pressed else { return }
            let buttons = recipientButtons(in: AXUIElementCreateApplication(getpid()), named: self.options.iphone)
            guard buttons.count <= 1 else {
                self.finish(1, "Multiple recipients have the same name; refusing to choose one."); return
            }
            if let button = buttons.first {
                guard AXUIElementPerformAction(button, kAXPressAction as CFString) == .success else { return }
                pressed = true
                log("Selected \(self.options.iphone); waiting for AirDrop completion")
            } else if !reported {
                reported = true
                log("Looking for the named iPhone in the picker. If macOS does not expose its button, select it manually within 60 seconds.")
            }
        }
    }

    func sharingService(_ sharingService: NSSharingService, sourceWindowForShareItems items: [Any],
                        sharingContentScope: UnsafeMutablePointer<NSSharingService.SharingContentScope>) -> NSWindow? { host }

    func sharingService(_ sharingService: NSSharingService, didShareItems items: [Any]) {
        guard service === sharingService, !exiting else { return }
        pickerTimer?.invalidate()
        service = nil
        if let file = screenshot { try? FileManager.default.removeItem(at: file) }
        screenshot = nil
        host.orderOut(nil)
        log("AirDrop reported completion")
        // Restore focus only if our picker still owns it, not if the user changed apps.
        if NSApp.isActive { chrome?.activate(options: []) }
        if options.once { finish(0, "One transfer completed") } else { schedule(after: options.interval) }
    }

    func sharingService(_ sharingService: NSSharingService, didFailToShareItems items: [Any], error: Error) {
        guard service === sharingService else { return }
        finish(1, "AirDrop failed or was cancelled: \(error.localizedDescription)")
    }

    @objc func stopFromMenu() { finish(0, "Stopped") }

    func finish(_ code: Int32, _ message: String) {
        guard !exiting else { return }
        exiting = true
        tickTimer?.invalidate()
        pickerTimer?.invalidate()
        service?.delegate = nil
        host.orderOut(nil)
        if let item = statusItem { NSStatusBar.system.removeStatusItem(item) }
        try? FileManager.default.removeItem(at: directory)
        close(lockFD)
        log(message)
        exit(code)
    }
}

do {
    let options = try Options(Array(CommandLine.arguments.dropFirst()))
    umask(0o077)
    let screenAllowed = CGPreflightScreenCaptureAccess()
    let accessibilityAllowed = AXIsProcessTrusted()
    if options.check {
        print("Screen Recording: \(screenAllowed ? "allowed" : "missing")")
        print("Accessibility: \(accessibilityAllowed ? "allowed" : "missing")")
        print("Recipient: \(options.iphone); interval: \(options.interval)s")
        print("No screenshot captured or sent. Run --once to verify AirDrop delivery.")
        exit(screenAllowed && accessibilityAllowed ? 0 : 1)
    }
    guard screenAllowed else {
        _ = CGRequestScreenCaptureAccess()
        throw Failure("Grant Screen Recording to this executable/terminal in System Settings > Privacy & Security, then rerun.")
    }
    guard accessibilityAllowed else {
        let prompt = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(prompt)
        throw Failure("Grant Accessibility to this executable/terminal in System Settings > Privacy & Security, then rerun.")
    }
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    let agent = try CaptureAgent(options: options)
    app.delegate = agent
    app.run()
    withExtendedLifetime(agent) {}
} catch {
    fputs("Error: \(error.localizedDescription)\nUse --help for usage.\n", stderr)
    exit(1)
}
