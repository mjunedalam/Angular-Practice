import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrViewComponent, WwellIrViewTab } from './wwell-ir-view.component';
import { WwellIrViewDetailsComponent } from './wwell-ir-view-details/wwell-ir-view-details.component';
import { WwellIrViewLetterComponent } from './wwell-ir-view-letter/wwell-ir-view-letter.component';
import { WwellIrViewWellDesignComponent } from './wwell-ir-view-well-design/wwell-ir-view-well-design.component';

/** The header's `sectionProgress` walks every rail section through wwellIrTimelineStepStatus, so
 *  the whole record has to be present even though this spec only exercises the tab bar. */
function buildIr(overrides: Partial<IntegratedRequirement> = {}): IntegratedRequirement {
  return {
    id: 'IR-9001',
    code: 'IR-9001',
    irSeq: 9001,
    updatedDate: '2026-08-01',
    status: 'draft',
    requestReference: {
      linkedRequestId: null,
      letterNumber: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 500,
      surfaceElevationFtAsl: 900,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completion: 'Open Hole',
      openHoleSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: null },
    testProgram: { testType: 'flow-test', estimatedRateGpm: null, estimatedWaterLevelFt: null, siwhpPsi: null },
    attachments: [],
    chain: [],
    sapWfId: null,
    sapWfStatusText: null,
    ...overrides,
  } as unknown as IntegratedRequirement;
}

// The three tab bodies are stubbed out: one renders a D3 wellbore diagram and another rasterises
// an SVG, neither of which this spec is about — it only cares which tab the bar has selected.
@Component({ selector: 'app-wwell-ir-view-details', standalone: true, template: 'details-body' })
class DetailsStub {
  readonly ir = input.required<IntegratedRequirement>();
  readonly linkedRequestWellOptions = input<readonly { readonly value: string; readonly label: string }[]>([]);
}

@Component({ selector: 'app-wwell-ir-view-well-design', standalone: true, template: 'well-design-body' })
class WellDesignStub {
  readonly ir = input.required<IntegratedRequirement>();
}

@Component({ selector: 'app-wwell-ir-view-letter', standalone: true, template: 'letter-body' })
class LetterStub {
  readonly ir = input.required<IntegratedRequirement>();
}

/** Stands in for WwellIrComponent, which is where the selected tab actually lives. */
@Component({
  standalone: true,
  imports: [WwellIrViewComponent],
  template: `<app-wwell-ir-view [ir]="ir()" [(activeTab)]="tab" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly ir = signal<IntegratedRequirement>(buildIr());
  readonly tab = signal<WwellIrViewTab>('details');
}

describe('WwellIrViewComponent — tab selection', () => {
  let fixture: ComponentFixture<HostComponent>;

  function tabButton(label: string): HTMLButtonElement {
    const button = Array.from(fixture.nativeElement.querySelectorAll('.irv__tab')).find(
      (element): element is HTMLButtonElement => (element as HTMLElement).textContent?.includes(label) ?? false,
    );
    if (!button) throw new Error(`No tab button labelled "${label}"`);
    return button;
  }

  function activeTabLabel(): string {
    return fixture.nativeElement.querySelector('.irv__tab--active')?.textContent?.trim() ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, NoopAnimationsModule],
      providers: [
        { provide: WwellIrService, useValue: { downloadLetterPdf: jest.fn() } },
        { provide: NotificationService, useValue: { error: jest.fn(), show: jest.fn(), notifications: jest.fn(() => []) } },
      ],
    })
      .overrideComponent(WwellIrViewComponent, {
        remove: { imports: [WwellIrViewDetailsComponent, WwellIrViewWellDesignComponent, WwellIrViewLetterComponent] },
        add: { imports: [DetailsStub, WellDesignStub, LetterStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('opens on Details', () => {
    expect(activeTabLabel()).toContain('Details');
    expect(fixture.nativeElement.textContent).toContain('details-body');
  });

  it('renders the body of whichever tab is selected', () => {
    tabButton('Well Design').click();
    fixture.detectChanges();

    expect(activeTabLabel()).toContain('Well Design');
    expect(fixture.nativeElement.textContent).toContain('well-design-body');
    expect(fixture.nativeElement.textContent).not.toContain('details-body');
  });

  it('writes the selected tab back out to its parent', () => {
    // The parent is the only thing that outlives a row switch, so the selection has to reach it —
    // a tab kept privately on this component would be lost the moment the panel is rebuilt.
    tabButton('Well Design').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.tab()).toBe('well-design');
  });

  it('keeps the selected tab when the panel is destroyed and rebuilt for another record', () => {
    // The regression: picking another IR swaps in a loading skeleton, which tears this component
    // down; the replacement used to start back on Details no matter which tab you had open.
    tabButton('Well Design').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.tab()).toBe('well-design');

    const carriedOver = fixture.componentInstance.tab();
    fixture.destroy();

    const rebuilt = TestBed.createComponent(HostComponent);
    rebuilt.componentInstance.tab.set(carriedOver);
    rebuilt.componentInstance.ir.set(buildIr({ id: 'IR-9002', code: 'IR-9002', irSeq: 9002 }));
    rebuilt.detectChanges();

    const active = rebuilt.nativeElement.querySelector('.irv__tab--active')?.textContent?.trim() ?? '';
    expect(active).toContain('Well Design');
    expect(rebuilt.nativeElement.textContent).toContain('well-design-body');
  });

  it('still lets a different tab be chosen on the newly-opened record', () => {
    tabButton('Well Design').click();
    fixture.detectChanges();

    tabButton('Letter').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.tab()).toBe('letter');
    expect(fixture.nativeElement.textContent).toContain('letter-body');
  });
});
