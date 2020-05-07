/* eslint-disable camelcase */
import {
    CollectAction,
    CreateAction, GetAction, ListAction, Resource,
    ResourceActions, ServiceResources, SingleDeleteAction, UpdateAction,
} from '@/lib/fluent-api/toolset';
import {
    COLLECT_MODE, CollectorModel, CollectorUpdateParameter,
    CollectorCollectParameter, CollectorCreateParameter, CollectorListResp,
} from '@/lib/fluent-api/inventory/collector.type';
import CollectorSchedule from '@/lib/fluent-api/inventory/collector-schedule';

const idField = 'collector_id';

interface IdParameter {
    [idField]: string;
}


class Create extends CreateAction<CollectorCreateParameter, any> {}

class Update extends UpdateAction<CollectorUpdateParameter, any> {
    idField = idField;

    setParameter(parameter: CollectorUpdateParameter): this {
        const api = this.clone();
        api.apiState.parameter = parameter;
        return api;
    }

    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter[idField] = id;
        return api;
    }
}

class Delete extends SingleDeleteAction<IdParameter, any> {
    idField = idField;
}

class Get extends GetAction<IdParameter, CollectorModel> {
    idField = idField;
}

class List extends ListAction<any, CollectorListResp> {}

class Collect extends CollectAction<CollectorCollectParameter, any> {
    idField = idField;

    setId(id: string): this {
        const api = this.clone();
        api.apiState.parameter.collector_id = id;
        return api;
    }

    setCollectMode(mode: COLLECT_MODE): this {
        const api = this.clone();
        api.apiState.parameter.collect_mode = mode;
        return api;
    }

    setCredentialId(credentialId: string): this {
        const api = this.clone();
        api.apiState.parameter.credential_id = credentialId;
        return api;
    }

    setCredentialGroupId(credentialGroupId: string): this {
        const api = this.clone();
        api.apiState.parameter.credential_group_id = credentialGroupId;
        return api;
    }

    setFilters(...args: any): this {
        const api = this.clone();
        api.apiState.parameter.filter = args;
        return api;
    }
}

export default class Collector extends Resource implements
    ResourceActions<'create'|'update'|'delete'|'get'|'list'|'collect'>,
    ServiceResources<'schedule'> {
    protected name = 'collector';

    create(): Create { return new Create(this.api, this.baseUrl); }

    update(): Update { return new Update(this.api, this.baseUrl); }

    delete(): Delete { return new Delete(this.api, this.baseUrl); }

    get(): Get { return new Get(this.api, this.baseUrl); }

    list(): List { return new List(this.api, this.baseUrl); }

    collect(): Collect { return new Collect(this.api, this.baseUrl); }

    schedule(): CollectorSchedule {
        const baseUrl = this.baseUrl.substring(1, this.baseUrl.length - 1);
        return new CollectorSchedule(this.api, baseUrl);
    }
}
