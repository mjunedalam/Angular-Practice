# Unified Smart Home Architecture

Project: G+1 Villa Unified Smart Home Solution  
Scope: First floor, common areas, exterior, garden, and expandable ground floor  
Document Type: Architecture + schematic design brief  

## 1. Objective

Create one unified smart home platform for a Ground + 1 Floor villa that controls lighting, fans, AC, curtains, TVs, washrooms, exterior lights, garden lighting, and common-area automation from one system.

The system must support:

- Local control inside the house
- Remote control from outside the house
- Physical wall switch fallback
- Mobile app control
- Voice assistant integration
- Scene control
- Scheduling
- Future expansion for security, CCTV, water tank, irrigation, and energy monitoring

## 2. Property Automation Scope

### 2.1 Main Areas

| Zone | Area | Automation Scope |
|---|---|---|
| First Floor | 5 bedrooms | Strip lights, COB lights, fan, AC, TV, curtains, intercom provision |
| First Floor | 5 attached washrooms | Strip lights, COB lights, exhaust fan |
| First Floor | Living area | Big TV, lighting, curtains, sunroof, AC/fan if required |
| First Floor | Dining area | Main lights, mood lights, optional curtains |
| First Floor | Prayer area | Soft scene lighting |
| First Floor | Powder room | Light and exhaust automation |
| Common | Staircase | Step lights, COB lights, strip lights, motion/night scene |
| Exterior | Front, rear, left, right | Facade, wall, gate, pathway, security lighting |
| Outdoor | Garden | Landscape lights, pathway lights, irrigation-ready control |

### 2.2 Standard Bedroom Device List

Each bedroom should include:

- False ceiling strip light control
- COB light control by group
- Fan ON/OFF and speed control
- AC control through IR blaster or brand gateway
- LCD TV power/source control if required
- Motorized curtain control for each window/glass section
- Intercom provision
- Wall keypad/manual switch fallback
- Room scenes

### 2.3 Standard Washroom Device List

Each attached washroom should include:

- Strip light control
- COB light control
- Exhaust fan control
- Optional occupancy sensor
- Optional humidity sensor
- Auto exhaust timer

## 3. Recommended System Architecture

Use a hybrid local-first architecture. The house should continue working even when the internet is unavailable.

```text
                         REMOTE ACCESS / CLOUD LAYER
 +------------------------------------------------------------------+
 | Mobile App / Web Dashboard / Voice Cloud                         |
 | User login, remote control, notifications, backup access          |
 +-------------------------------+----------------------------------+
                                 | HTTPS / MQTTS
                                 v
 +------------------------------------------------------------------+
 | Cloud Broker + API                                               |
 | Authentication, remote relay, encrypted device messaging          |
 +-------------------------------+----------------------------------+
                                 | Secure outbound bridge
                                 v
                         LOCAL HOME EDGE LAYER
 +------------------------------------------------------------------+
 | Smart Home Edge Gateway                                          |
 | Mini PC / industrial controller / Home Assistant class gateway    |
 | - Local automation engine                                        |
 | - Local MQTT broker                                              |
 | - Device registry                                                |
 | - Scene engine                                                   |
 | - Local dashboard/API                                            |
 +-------+---------------------------+-----------------------+--------+
         |                           |                       |
         | Wi-Fi / Ethernet          | Zigbee / Thread        | IR / RS485 / dry contact
         v                           v                       v
 +---------------+           +----------------+       +----------------+
 | Room Modules  |           | Sensor Network |       | AC / TV / AV   |
 | Lights, fan,  |           | motion, temp,  |       | curtain, gate, |
 | curtains      |           | humidity       |       | intercom link  |
 +---------------+           +----------------+       +----------------+
```

## 4. Network Architecture

### 4.1 Physical Network

```text
 ISP Fiber Router
       |
       +-- Main Network Switch
       |       +-- Smart Home Edge Gateway
       |       +-- Wi-Fi Access Points
       |       +-- CCTV NVR future provision
       |       +-- Admin/maintenance port
       |
       +-- Guest Wi-Fi isolated from smart home devices

 Smart Home VLAN / Network
       +-- Room controllers
       +-- Curtain controllers
       +-- AC IR gateways
       +-- Exterior lighting controllers
       +-- Garden controllers
       +-- Sensors
```

### 4.2 Recommended Network Separation

| Network | Purpose | Access |
|---|---|---|
| Main LAN | Owner phones, tablets, laptops | Full local access |
| Smart Home LAN/VLAN | Controllers, sensors, gateway | Restricted |
| Guest Wi-Fi | Visitors | Internet only |
| CCTV VLAN future | Cameras/NVR | Restricted |

## 5. Protocol Architecture

| Function | Recommended Protocol |
|---|---|
| Local control commands | MQTT over LAN |
| Remote control | HTTPS + secure MQTT bridge |
| Low-power sensors | Zigbee / Thread |
| High-load reliable controllers | Wired relay/dimmer modules |
| AC control | IR blaster or brand-specific API/gateway |
| Curtain motors | Relay/dry contact, RS485, or motor controller |
| TV control | IR, HDMI-CEC, or IP control where supported |
| Intercom integration | Dry contact/API only if supported by intercom brand |

## 6. Complete System Block Diagram

```text
+-------------------------------------------------------------------+
|                           USER CONTROL                            |
+---------------------+----------------------+----------------------+
| Mobile App          | Wall Keypads         | Voice Assistant      |
| Local + Remote      | Manual fallback      | Optional             |
+----------+----------+----------+-----------+----------+-----------+
           |                     |                      |
           v                     v                      v
+-------------------------------------------------------------------+
|                       LOCAL EDGE GATEWAY                          |
| Automation engine | MQTT broker | Scene engine | Device registry   |
+-----+---------------+------------------+-------------------+------+
      |               |                  |                   |
      v               v                  v                   v
+-----------+   +------------+    +--------------+    +---------------+
| Lighting  |   | Climate    |    | Curtains     |    | Sensors       |
| modules   |   | AC + fan   |    | motors       |    | motion/humid. |
+----+------+   +-----+------+    +------+-------+    +------+--------+
     |                |                  |                   |
     v                v                  v                   v
 COB/strip        AC, fan speed      Open/close/stop     Automation input
 lights           comfort scenes     position scenes     alerts and logic
```

## 7. Room Controller Schematic

One smart controller per bedroom is recommended. High-load circuits must be sized by a licensed electrician.

```text
                      BEDROOM SMART CONTROLLER

  230V AC IN
     |
     +-- MCB / protection from DB
     |
     +-- Power supply 230V AC to 5V/12V DC
     |
     v
+--------------------------------------------------------------+
| Controller MCU / Smart Relay Module                          |
|                                                              |
| Inputs                                                       |
| - Manual switch/keypad input                                 |
| - Curtain limit/feedback input where available               |
| - Optional motion/temp sensor                                |
|                                                              |
| Outputs                                                      |
| - Relay 1: COB light group 1                                 |
| - Relay 2: COB light group 2                                 |
| - Dimmer/PWM: false ceiling strip light                      |
| - Fan relay/speed controller                                 |
| - Curtain open relay/dry contact                             |
| - Curtain close relay/dry contact                            |
| - IR output: AC / TV                                         |
|                                                              |
| Network                                                      |
| - Wi-Fi/Ethernet/Zigbee depending on selected module          |
+--------------------------------------------------------------+
     |             |             |             |
     v             v             v             v
 COB lights    Strip driver   Fan control   Curtain motor
```

## 8. Bedroom Wiring Concept

```text
 DB Lighting Circuit
       |
       v
 Bedroom Switch Box / Automation Panel
       |
       +-- Smart relay channel 1 -- COB lights group A
       +-- Smart relay channel 2 -- COB lights group B
       +-- LED dimmer channel  ---- 12V/24V strip light driver
       +-- Fan controller      ---- Ceiling fan
       +-- Curtain channel A   ---- Curtain motor open
       +-- Curtain channel B   ---- Curtain motor close
       +-- IR blaster          ---- AC + TV

 Manual wall switches remain connected to controller inputs.
 If automation fails, manual control must still operate critical lights.
```

## 9. Washroom Controller Schematic

```text
                    WASHROOM SMART CONTROLLER

  Lighting circuit from DB
          |
          v
+-----------------------------------------------+
| Washroom relay module                         |
|                                               |
| Inputs                                        |
| - Manual switch                               |
| - Optional occupancy sensor                   |
| - Optional humidity sensor                    |
|                                               |
| Outputs                                       |
| - Relay 1: COB lights                         |
| - Relay 2: strip lights                       |
| - Relay 3: exhaust fan                        |
+-----------------------------------------------+
          |                  |                 |
          v                  v                 v
       COB lights        Strip lights      Exhaust fan
```

## 10. Living Area Schematic

```text
                         LIVING AREA CONTROL

+------------------------------------------------------------------+
| Living area controller                                           |
|                                                                  |
| Lighting                                                         |
| - Main COB groups                                                |
| - Cove/strip lights                                              |
| - Feature wall lights                                            |
| - Staircase-linked lighting scene                                |
|                                                                  |
| Media                                                            |
| - Big LCD TV IR/IP control                                       |
| - Optional AV receiver                                           |
|                                                                  |
| Openings                                                         |
| - Curtain motor groups for glass areas                           |
| - Sunroof motor/open-close control if compatible                  |
|                                                                  |
| Scenes                                                           |
| - Guest, Movie, Relax, Bright, All Off                           |
+------------------------------------------------------------------+
```

## 11. Exterior And Garden Schematic

```text
                         EXTERIOR CONTROL PANEL

             From dedicated exterior lighting MCB
                           |
                           v
+------------------------------------------------------------------+
| Outdoor-rated automation panel                                   |
|                                                                  |
| Outputs                                                          |
| - Front facade lights                                            |
| - Rear lights                                                    |
| - Left side wall lights                                          |
| - Right side wall lights                                         |
| - Gate/entry lights                                              |
| - Garden lights                                                  |
| - Pathway lights                                                 |
| - Irrigation pump/valve future provision                         |
|                                                                  |
| Inputs                                                           |
| - Motion sensors optional                                        |
| - Light sensor optional                                          |
| - Rain/soil sensor future provision                              |
+------------------------------------------------------------------+
```

## 12. Suggested Controller Distribution

| Location | Controller Type | Notes |
|---|---|---|
| Bedroom 1 | Room controller | Lights, fan, AC, TV, curtains |
| Bedroom 2 | Room controller | Lights, fan, AC, TV, curtains |
| Bedroom 3 | Room controller | Lights, fan, AC, TV, curtains |
| Bedroom 4 | Room controller | Lights, fan, AC, TV, curtains |
| Bedroom 5 | Room controller | Lights, fan, AC, TV, curtains |
| Each attached washroom | 3-channel relay module | COB, strip, exhaust |
| Living area | Multi-channel controller | Lighting, curtains, TV, sunroof |
| Dining/prayer area | Lighting controller | Scene control |
| Staircase | Lighting + motion controller | Night automation |
| Powder room | 3-channel relay module | Light and exhaust |
| Exterior panel | Outdoor-rated relay panel | Zone-wise exterior control |
| Garden | Outdoor controller | Lights and irrigation-ready |

## 13. Room Naming And Device Naming Standard

Use consistent names from day one.

```text
floor/area/device/function

Examples:
first/bedroom1/light/cob
first/bedroom1/light/strip
first/bedroom1/fan/main
first/bedroom1/ac/main
first/bedroom1/curtain/window1
first/washroom1/exhaust/main
exterior/front/light/facade
garden/light/pathway
```

## 14. MQTT Topic Structure

```text
home/{floor}/{area}/{device}/{function}/set
home/{floor}/{area}/{device}/{function}/state
home/{floor}/{area}/{device}/{function}/telemetry
home/{floor}/{area}/{scene}/trigger
```

Examples:

```text
home/first/bedroom1/light/cob/set
home/first/bedroom1/light/cob/state
home/first/bedroom1/ac/main/set
home/first/living/scene/movie/trigger
home/exterior/front/light/facade/set
```

## 15. Control Flow - Local Mode

```text
User taps mobile app inside house
        |
        v
App detects local gateway
        |
        v
Command sent directly to local gateway
        |
        v
Local MQTT broker publishes command
        |
        v
Room controller receives command
        |
        v
Relay/dimmer/IR/curtain output executes
        |
        v
Device state returns to app
```

## 16. Control Flow - Remote Mode

```text
User taps mobile app outside house
        |
        v
Command sent to cloud API
        |
        v
Cloud authenticates user
        |
        v
Cloud broker forwards command through secure bridge
        |
        v
Local gateway receives command
        |
        v
Local MQTT broker publishes command
        |
        v
Room controller executes
        |
        v
State sync returns to cloud and app
```

## 17. Scene Architecture

### 17.1 Bedroom Scenes

| Scene | Action |
|---|---|
| Relax | Strip light warm/dim, COB low, fan medium, curtains partial close |
| Sleep | Lights off, fan set, AC sleep mode, curtains close |
| Wake Up | Curtains open, soft strip light, AC/fan adjust |
| Movie | COB off, strip dim, curtains close, TV on |
| All Off | Lights off, fan/AC optional, curtains unchanged or close |

### 17.2 Common Scenes

| Scene | Action |
|---|---|
| Good Morning | Selected curtains open, soft lights, exterior off |
| Good Night | Interior off, bedroom sleep scenes, exterior security on |
| Guest Mode | Living/dining/prayer lighting ready |
| Prayer Mode | Prayer area warm light, distractions off |
| Dining Mode | Dining lights warm and focused |
| Movie Mode | Living curtains close, lights dim, TV on |
| Away Mode | All non-essential loads off, exterior/security active |
| Vacation Mode | Randomized evening lights, exterior schedule |

## 18. Security Architecture

```text
+--------------------------------------------------------------+
| Security controls                                            |
+--------------------------------------------------------------+
| - Separate smart home network/VLAN                           |
| - No direct public port forwarding to local gateway           |
| - Remote access through secure cloud tunnel only              |
| - Strong admin password and multi-user roles                  |
| - Device certificates or unique tokens                        |
| - Encrypted cloud communication                               |
| - Local firewall on edge gateway                              |
| - Guest Wi-Fi isolated from automation devices                |
+--------------------------------------------------------------+
```

## 19. Safety Requirements

- All 230V AC work must be handled by a licensed electrician.
- Use certified relay/dimmer modules with correct load rating.
- Use separate MCBs for lighting, power, AC, exterior, and garden circuits.
- Use surge protection at DB level.
- Keep low-voltage control wiring separate from high-voltage wiring.
- Use outdoor-rated IP65/IP67 enclosures for exterior and garden controllers.
- Do not place non-waterproof modules inside washroom wet zones.
- Manual override must be available for essential lighting.
- AC loads must not be switched through small lighting relays.

## 20. Implementation Phases

### Phase 1 - Survey

- Confirm complete floor plan
- Count COB lights per room
- Measure strip light lengths
- Count curtain motors
- Confirm AC brand/model per room
- Confirm fan type
- Confirm switchboard and DB locations
- Confirm exterior and garden lighting zones

### Phase 2 - Electrical Design

- Circuit load calculation
- Relay/dimmer channel mapping
- DB/MCB mapping
- Switchboard module placement
- Cable routing
- Low-voltage and high-voltage separation

### Phase 3 - Network Design

- Gateway location
- Router and switch location
- Wi-Fi access point placement
- Smart home VLAN setup
- Zigbee/Thread coordinator location if sensors are used

### Phase 4 - Installation

- Install smart modules
- Install curtain motors
- Install sensors
- Install gateway
- Pair devices
- Configure rooms and scenes

### Phase 5 - Testing

- Test manual switches
- Test app control
- Test internet-offline local control
- Test remote control
- Test scenes
- Test schedules
- Test safety fallback

## 21. Minimum BOQ Categories

| Category | Items |
|---|---|
| Central control | Edge gateway, router/switch, backup power |
| Lighting control | Relay modules, dimmers, LED strip drivers |
| Fan control | Fan controllers or compatible smart regulators |
| AC control | IR blasters or AC gateway modules |
| Curtain control | Curtain motors, motor controllers, brackets |
| Sensors | Motion, temperature, humidity, door/window optional |
| Exterior | Outdoor relay panel, weatherproof enclosures |
| Garden | Outdoor light controller, irrigation provision |
| Safety | MCBs, surge protector, isolation, proper enclosures |

## 22. Final Architecture Recommendation

Use a local-first smart home architecture with a central edge gateway, room-wise controllers, dedicated washroom controllers, an outdoor-rated exterior panel, and secure cloud access only for remote operation.

The design should avoid dependency on the internet for basic home operation. Lighting, fans, curtains, AC control, washroom exhausts, and exterior scenes should all continue working locally through wall switches and the local gateway.
