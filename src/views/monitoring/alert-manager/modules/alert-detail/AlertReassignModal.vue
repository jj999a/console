<template>
    <p-button-modal
        class="alert-reassign-modal"
        header-title="Reassign to other member"
        size="md"
        :visible.sync="proxyVisible"
        :loading="modalLoading"
        @confirm="onClickReassign"
    >
        <template #body>
            <p-toolbox-table :excel-visible="false"
                             selectable
                             sortable
                             :multi-select="false"
                             :fields="fields"
                             :items="items"
                             :select-index.sync="selectIndex"
                             :loading="loading"
                             :total-count="totalCount"
                             @change="onChangeTable"
                             @refresh="onChangeTable()"
            >
                <template #col-resource_id-format="{ value }">
                    {{ users[value].name }}
                </template>
            </p-toolbox-table>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PToolboxTable } from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { makeProxy } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';
import store from '@/store';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';

export default {
    name: 'AlertReassignModal',
    components: {
        PButtonModal,
        PToolboxTable,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        projectId: {
            type: String,
            default: undefined,
        },
        alertId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit, root }) {
        const state = reactive({
            //
            modalLoading: false,
            proxyVisible: makeProxy('visible', props, emit),
            //
            loading: true,
            selectIndex: [] as number[],
            selectedUserID: computed(() => state.items[state.selectIndex]?.resource_id),
            fields: [
                { label: 'User ID', name: 'user_id', type: 'item' },
                { label: 'Name', name: 'resource_id', type: 'item' },
            ],
            items: [] as any,
            totalCount: 0,
            users: computed(() => store.state.resource.user.items),
        });

        const reassignMember = async () => {
            try {
                await SpaceConnector.client.monitoring.alert.update({
                    alert_id: props.alertId,
                    assignee: state.selectedUserID,
                });
                showSuccessMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_S_ASSIGN_MEMBER'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('MONITORING.ALERT.DETAIL.HEADER.ALT_E_ASSIGN_MEMBER'), e, root);
            } finally {
                state.proxyVisible = false;
            }
        };

        const onClickReassign = async () => {
            await reassignMember();
            emit('confirm');
        };


        const assignApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(15)
            .setSort('resource_id', true);

        let assignApiQuery = assignApiQueryHelper.data;

        const listMemberInProject = async () => {
            try {
                state.loading = true;
                const { results, total_count } = await SpaceConnector.client.identity.project.member.list({
                    project_id: props.projectId,
                    query: assignApiQuery,
                    include_parent_member: true,
                });
                state.items = results.map(d => ({
                    ...d,
                    user_id: d.resource_id,
                }));
                state.totalCount = total_count;
            } catch (e) {
                console.error(e);
                state.items = [];
            } finally {
                state.loading = false;
            }
        };

        const onChangeTable = async (options: any = {}) => {
            assignApiQuery = getApiQueryWithToolboxOptions(assignApiQueryHelper, options) ?? assignApiQuery;
            await listMemberInProject();
        };
        (async () => {
            await Promise.all([store.dispatch('resource/user/load'), listMemberInProject()]);
        })();
        return {
            ...toRefs(state),
            onClickReassign,
            onChangeTable,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
