import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput, AzurermBackend } from "cdktf";
import { AzurermProvider } from "./.gen/providers/azurerm/provider";
import { ResourceGroup } from "./.gen/providers/azurerm/resource-group";
import { DataAzurermNetworkSecurityGroup } from "./.gen/providers/azurerm/data-azurerm-network-security-group";
import { ManagementHost } from "./.gen/providers/checkpoint/management-host";
import { CheckpointProvider } from "./.gen/providers/checkpoint/provider";

import { DataTerraformRemoteStateAzurerm } from "cdktf";

import { DataCheckpointManagementDataHost } from "./.gen/providers/checkpoint/data-checkpoint-management-data-host";

require('dotenv').config();

const CPAPIKEY = process.env.CPAPIKEY || 'use-your-own-key';
const CPSERVER = process.env.CPSERVER || 'use-your-own-key';
const CPTENANT = process.env.CPTENANT || 'use-your-own-key';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    new AzurermProvider(this, "azure", {
      features: {},
    });

    new CheckpointProvider(this, "checkpoint", {
      //       
      server: CPSERVER,
      apiKey: CPAPIKEY,
      context: "web_api",
      cloudMgmtId: CPTENANT
    });

    const hostPankrac = new ManagementHost(this, "pankrac", {
      name: "pankrac",
      ipv4Address: "1.2.3.4",
      color: "orange"
    })

    const range = (count: number) => Array.from({ length: count }, (_, i) => i + 1);

    for (const i of range(10)) {
       new ManagementHost(this,`host${i}`, {
        name: `host${i}`,
        ipv4Address: `192.168.107.${i}`,
        color: "blue",
        tags: ["tag1", "tag2", "MadeByCDKTF"]
      })
    }

    new TerraformOutput(this, "hostPankrac", {
      value: hostPankrac
    });

    // read NSG
    const nsgData = new DataAzurermNetworkSecurityGroup(this, "nsg1", {
      resourceGroupName: "rg-nsg1",
      name: "WebDemo",
    });
    console.log(nsgData.id);

    // existing resource group to be managed here
    new ResourceGroup(this, "existing_resource_group", {
      name: "existing_resource_group",
      location: "West Europe",
      tags: { 'environment': 'dev' }
    });


    // https://www.hashicorp.com/blog/cdktf-0-19-adds-support-for-config-driven-import-and-refactoring
    // new ResourceGroup(this, "rg-nsg1", {}).importFrom('/subscriptions/f4ad5e85-ec75-4321-8854-ed7eb611f61d/resourceGroups/rg-nsg1');

    // existing resource group to be managed here
    // new ResourceGroup(this, "rg-ssh", {
    //   name: "rg-ssh",
    //   location: "West Europe",
    //   tags: { 'environment': 'dev' }
    // });


    // backend
    const backendConfig = {
      resourceGroupName: "tfstate",
      storageAccountName: "tfstate5",
      containerName: "tfstate",
      key: "cdk-terraform.tfstate",
    };
    new AzurermBackend(this, backendConfig);


    // Create a resource group
    new ResourceGroup(this, "resource_group", {
      name: "cdktf-rg",
      location: "West Europe",
    });

    new TerraformOutput(this, "greeting", {
      value: `Hello world!`,
    });

    new TerraformOutput(this, "nsg1out", {
      value: nsgData
    });

    const host_tik = new DataCheckpointManagementDataHost(this, "host_tik", {
      name: "tik.cesnet.cz"
    })
    new TerraformOutput(this, "ip_tik", {
      value: host_tik.ipv4Address
    });

    const tfState = new DataTerraformRemoteStateAzurerm(this, "tfstate", backendConfig);
    const greet = tfState.get("greeting");
    new TerraformOutput(this, "greetFromRemoteState", {
      value: greet
    });

    // new TerraformOutput(this, "nsg1_info_from_remote_state", {
    //   value: tfState.get("nsg1out")
    // });

  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
