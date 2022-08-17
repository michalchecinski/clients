import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UntypedFormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { SyncService } from "@bitwarden/common/abstractions/sync.service";
import { ProductType } from "@bitwarden/common/enums/productType";

import { OrganizationPlansComponent } from "../../settings/organization-plans.component";

@Component({
  selector: "app-billing",
  templateUrl: "./billing.component.html",
})
export class BillingComponent extends OrganizationPlansComponent {
  @Input() orgInfoForm: FormGroup;
  @Output() previousStep = new EventEmitter();

  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    cryptoService: CryptoService,
    router: Router,
    syncService: SyncService,
    policyService: PolicyService,
    organizationService: OrganizationService,
    logService: LogService,
    messagingService: MessagingService,
    formBuilder: UntypedFormBuilder
  ) {
    super(
      apiService,
      i18nService,
      platformUtilsService,
      cryptoService,
      router,
      syncService,
      policyService,
      organizationService,
      logService,
      messagingService,
      formBuilder
    );
  }

  async ngOnInit() {
    const additionalSeats = this.product == ProductType.Families ? 0 : 1;
    this.formGroup.patchValue({
      name: this.orgInfoForm.get("name")?.value,
      billingEmail: this.orgInfoForm.get("email")?.value,
      additionalSeats: additionalSeats,
      plan: this.plan,
      product: this.product,
    });
    this.isInTrialFlow = true;
    await super.ngOnInit();
  }

  stepBack() {
    this.previousStep.emit();
  }
}
