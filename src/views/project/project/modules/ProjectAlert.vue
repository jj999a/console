<template>
    <div class="project-alert">
        <alert-data-table
            :project-id="id"
            :alert-state="alertState"
            @update="onUpdateTable"
        />
    </div>
</template>

<script lang="ts">
import {
    onActivated, reactive, toRefs,
} from '@vue/composition-api';
import AlertDataTable from '@/views/monitoring/alert-manager/modules/alert-list/AlertDataTable.vue';
import {ALERT_STATE_FILTER, ALERT_URGENCY, ASSIGNED_STATE} from '@/views/monitoring/alert-manager/lib/config';
import { AlertListPageUrlQuery, AlertListTableFilters } from '@/views/monitoring/alert-manager/type';
import router from '@/routes';
import {QueryHelper} from "@spaceone/console-core-lib/query";

export default {
    name: 'ProjectAlert',
    components: {
        AlertDataTable,
    },
    props: {
        id: {
            type: String,
            default: '',
        },
    },
    setup() {
        const tagQueryHelper = new QueryHelper().setFiltersAsRawQueryString(router.currentRoute.query.filters);
        const state = reactive({
            alertState: router.currentRoute.query.state ?? ALERT_STATE_FILTER.OPEN,
            urgency: router.currentRoute.query.state ?? ALERT_URGENCY.ALL,
            assigned: router.currentRoute.query.state ?? ASSIGNED_STATE.ALL,
        });

        /* util */
        const replaceAlertListPageUrlQuery = (query: AlertListPageUrlQuery) => {
            router.replace({
                query: {
                    ...router.currentRoute.query,
                    ...query,
                },
            }).catch(() => {});
        };
        const onUpdateTable = (changed: Partial<AlertListTableFilters>) => {
            const query: AlertListPageUrlQuery = {};
            if (changed.state) {
                state.alertState = changed.state;
                query.state = changed.state;
            }
            if (changed.urgency) {
                state.urgency = changed.urgency;
                query.urgency = changed.urgency;
            }
            if (changed.assigned) {
                state.assigned = changed.assigned;
                query.assigned = changed.assigned;
            }
            if (changed.filters) {
                tagQueryHelper.setFilters(changed.filters);
                query.filters = tagQueryHelper.rawQueryStrings;
            }
            replaceAlertListPageUrlQuery(query);
        };

        onActivated(() => {
            state.alertState = router.currentRoute.query.state;
        });

        return {
            ...toRefs(state),
            onUpdateTable,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-alert::v-deep {
    .p-toolbox-table {
        @apply border-0;
        .p-data-table {
            th:nth-child(8), td:nth-child(8) {
                @apply hidden;
            }
        }
    }
}
</style>
