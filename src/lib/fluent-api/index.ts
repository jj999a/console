import InventoryService from './inventory';
import PluginService from './plugin';
import SecretService from './secret';
import IdentityService from './identity';
import RepositoryService from './repository';
import AddOns from "./add-ons";

export class FluentApi {
    inventory = () => new InventoryService();

    plugin = () => new PluginService();

    secret = () => new SecretService();

    identity = () => new IdentityService();

    repository = () => new RepositoryService();

    addons = () => new AddOns();
}

// @ts-ignore
export const fluentApi = new FluentApi();
// @ts-ignore
export default fluentApi;
export * from './type';
export * from './toolset';