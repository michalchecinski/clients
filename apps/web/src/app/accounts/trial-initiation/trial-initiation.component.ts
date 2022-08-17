import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { TitleCasePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/abstractions/policy/policy-api.service.abstraction";
import { PolicyService } from "@bitwarden/common/abstractions/policy/policy.service.abstraction";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PlanType } from "@bitwarden/common/enums/planType";
import { ProductType } from "@bitwarden/common/enums/productType";
import { PolicyData } from "@bitwarden/common/models/data/policyData";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/masterPasswordPolicyOptions";
import { Policy } from "@bitwarden/common/models/domain/policy";

import { VerticalStepperComponent } from "./vertical-stepper/vertical-stepper.component";

@Component({
  selector: "app-trial",
  templateUrl: "trial-initiation.component.html",
})
export class TrialInitiationComponent implements OnInit {
  email = "";
  org = "";
  orgInfoSubLabel = "";
  orgId = "";
  orgLabel = "";
  billingSubLabel = "";
  plan: PlanType;
  product: ProductType;
  accountCreateOnly = true;
  policies: Policy[];
  enforcedPolicyOptions: MasterPasswordPolicyOptions;
  validOrgs: string[] = ["teams", "enterprise", "families"];
  @ViewChild("stepper", { static: false }) verticalStepper: VerticalStepperComponent;

  orgInfoFormGroup = this.formBuilder.group({
    name: ["", [Validators.required]],
    email: [""],
  });

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private formBuilder: UntypedFormBuilder,
    private titleCasePipe: TitleCasePipe,
    private stateService: StateService,
    private logService: LogService,
    private policyApiService: PolicyApiServiceAbstraction,
    private policyService: PolicyService,
    private i18nService: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.pipe(first()).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email = qParams.email;
      }

      if (!qParams.org) {
        return;
      }

      if (this.validOrgs.includes(qParams.org)) {
        this.org = qParams.org;
      } else {
        this.org = "families";
      }

      this.orgLabel = this.titleCasePipe.transform(this.org);
      this.accountCreateOnly = false;

      if (this.org === "families") {
        this.plan = PlanType.FamiliesAnnually;
        this.product = ProductType.Families;
      } else if (this.org === "teams") {
        this.plan = PlanType.TeamsAnnually;
        this.product = ProductType.Teams;
      } else if (this.org === "enterprise") {
        this.plan = PlanType.EnterpriseAnnually;
        this.product = ProductType.Enterprise;
      }
    });

    const invite = await this.stateService.getOrganizationInvitation();
    if (invite != null) {
      try {
        const policies = await this.policyApiService.getPoliciesByToken(
          invite.organizationId,
          invite.token,
          invite.email,
          invite.organizationUserId
        );
        if (policies.data != null) {
          const policiesData = policies.data.map((p) => new PolicyData(p));
          this.policies = policiesData.map((p) => new Policy(p));
        }
      } catch (e) {
        this.logService.error(e);
      }
    }

    if (this.policies != null) {
      this.enforcedPolicyOptions = await this.policyService.getMasterPasswordPolicyOptions(
        this.policies
      );
    }
  }

  stepSelectionChange(event: StepperSelectionEvent) {
    // Set org info sub label
    if (event.selectedIndex === 1 && this.orgInfoFormGroup.controls.name.value === "") {
      this.orgInfoSubLabel =
        "Enter your " + this.titleCasePipe.transform(this.org) + " organization information";
    } else if (event.previouslySelectedIndex === 1) {
      this.orgInfoSubLabel = this.orgInfoFormGroup.controls.name.value;
    }

    //set billing sub label
    if (event.selectedIndex === 2) {
      this.billingSubLabel = this.i18nService.t("billingTrialSubLabel");
    }
  }

  createdAccount(email: string) {
    this.email = email;
    this.orgInfoFormGroup.get("email")?.setValue(email);
    this.verticalStepper.next();
  }

  billingSuccess(event: any) {
    this.orgId = event?.orgId;
    this.billingSubLabel = event?.subLabelText;
    this.verticalStepper.next();
  }

  navigateToOrgVault() {
    this.router.navigate(["organizations", this.orgId, "vault"]);
  }

  navigateToOrgInvite() {
    this.router.navigate(["organizations", this.orgId, "manage", "people"]);
  }

  previousStep() {
    this.verticalStepper.previous();
  }
}
