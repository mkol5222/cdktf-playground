https://www.oreondevelopment.com/devops/hachicorps-cdk-for-terraform-typescript-a-quick-tutorial/

```bash
# install CDKTF
npm install --global cdktf-cli@latest

# start new project (already done)
cdktf init --template=typescript --local
# choose azurerm provider by adding to cdktf.json
### "terraformProviders": ["azurerm@~> 3.0"],

#
npm install @cdktf/provider-azurerm

# download and generate provider (.gen folder)
cdktf get

#
cdktf watch --auto-approve
# or
cdktf synth
cdktf deploy
```

source = "CheckPointSW/checkpoint"
version = "2.6.0"