<template>
    <div class="project-search-widget">
        <p-toolbox search-type="query"
                   :query-tags="tags"
                   :key-item-sets="handlers.keyItemSets"
                   :value-handler-map="handlers.valueHandlerMap"
                   :total-count="totalCount"
                   :page-size.sync="pageLimit"
                   :page-size-options="[12, 24, 36]"
                   @change="onChange"
                   @refresh="onChange()"
        />
        <div class="box-group">
            <div v-for="(item, idx) in items" :key="`box-${idx}`" class="box"
                 @click="onClickProjectBox(item)"
            >
                <p class="sub-title">
                    {{ projectGroupNameFormatter(item.project_id) }}
                </p>
                <p class="title">
                    {{ projectNameFormatter(item.project_id) }}
                </p>
                <div class="content-wrapper" :class="{'multiple-items': item.alert_count > 0 && item.maintenance_window_count > 0}">
                    <project-maintenance-window-list-item v-if="item.maintenance_window_count > 0" :project-id="item.project_id" />
                    <project-alert-list-item v-if="item.alert_count > 0" :project-id="item.project_id" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PToolbox } from '@spaceone/design-system';
import ProjectAlertListItem from '@/views/monitoring/alert-manager/modules/alert-dashboard/ProjectAlertListItem.vue';
import ProjectMaintenanceWindowListItem from '@/views/monitoring/alert-manager/modules/alert-dashboard/ProjectMaintenanceWindowListItem.vue';

import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { makeReferenceValueHandler } from '@spaceone/console-core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { store } from '@/store';
import { PROJECT_ROUTE } from '@/routes/project/project-route';
import router from '@/routes';


export default {
    name: 'ProjectSearchWidget',
    components: {
        PToolbox,
        ProjectAlertListItem,
        ProjectMaintenanceWindowListItem,
    },
    props: {
        activatedProjects: {
            type: Array,
            default: () => ([]),
        },
    },
    setup(props) {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            totalCount: 0,
            pageLimit: 12,
            items: [],
            tags: [],
        });
        const handlers = {
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'project_id', label: 'Project' },
                ],
            }] as KeyItemSet[],
            valueHandlerMap: {
                project_id: makeReferenceValueHandler('identity.Project'),
            },
        };

        /* util */
        const projectGroupNameFormatter = (projectId) => {
            const projectLabel = state.projects[projectId]?.label;
            const projectName = state.projects[projectId]?.name;
            if (!projectLabel || projectLabel === projectName) return undefined;
            return projectLabel.replace(` > ${projectName}`, '');
        };
        const projectNameFormatter = projectId => state.projects[projectId]?.name || projectId;
        const countFormatter = (count) => {
            if (count > 15) return '15+';
            return count;
        };

        /* api */
        const AlertByProjectApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(state.pageLimit);
        let AlertByProjectApiQuery = AlertByProjectApiQueryHelper.data;
        const listAlertByProject = async () => {
            try {
                const { results, total_count } = await SpaceConnector.client.monitoring.dashboard.alertByProject({
                    // eslint-disable-next-line camelcase
                    activated_projects: props.activatedProjects,
                    query: AlertByProjectApiQuery,
                });
                state.items = results;
                state.totalCount = total_count;
            } catch (e) {
                console.error(e);
            }
        };

        /* event */
        const onChange = async (options: any) => {
            AlertByProjectApiQuery = getApiQueryWithToolboxOptions(AlertByProjectApiQueryHelper, options) ?? AlertByProjectApiQuery;
            await listAlertByProject();
        };
        const onClickProjectBox = (item) => {
            if (item.maintenance_window_count > 0) {
                router.push({ name: PROJECT_ROUTE.DETAIL.TAB.MAINTENANCE_WINDOW._NAME, params: { id: item.project_id } });
            } else {
                router.push({ name: PROJECT_ROUTE.DETAIL.TAB.ALERT.ALERT._NAME, params: { id: item.project_id } });
            }
        };

        /* init */
        watch(() => props.activatedProjects, async (activatedProjects) => {
            if (activatedProjects.length) {
                await listAlertByProject();
            }
        });

        return {
            ...toRefs(state),
            handlers,
            onChange,
            onClickProjectBox,
            projectGroupNameFormatter,
            projectNameFormatter,
            countFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-search-widget {
    .p-toolbox::v-deep {
        .p-search {
            border-radius: 0.25rem;
        }
    }

    .box-group {
        @apply grid grid-cols-12;
        gap: 1rem;

        .box {
            @apply col-span-6 bg-white border border-gray-200 rounded-md;
            height: 20rem;
            box-sizing: border-box;
            box-shadow: 0 0.125rem 0.25rem rgba(theme('colors.black'), 0.06);
            cursor: pointer;
            padding: 1rem;

            &:hover {
                @apply bg-secondary2;
            }

            .sub-title {
                @apply text-gray-500;
                line-height: 1.3;
                font-size: 0.75rem;
            }
            .title {
                line-height: 1.6;
                font-size: 1rem;
                font-weight: bold;
                margin-bottom: 0.75rem;
            }
            .content-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;

                .project-maintenance-window-list-item::v-deep, .project-alert-list-item::v-deep {
                    .body {
                        max-height: 12.5rem;
                    }
                }

                &.multiple-items {
                    .project-maintenance-window-list-item::v-deep, .project-alert-list-item::v-deep {
                        .body {
                            max-height: 5rem;
                        }
                    }
                }
            }
        }
    }

    @screen mobile {
        .box-group {
            .box {
                @apply col-span-12;
            }
        }
    }
}
</style>
