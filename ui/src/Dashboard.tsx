import {
    DeleteButton,
    EditButton,
    List,
    ShowButton,
    TextField,
    useTable,
} from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import React from "react";


export const Dashboard = () => {
    const { tableProps } = useTable({
        resource: "services"
    });

    return (
        <List title="Organisation" >
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title={"ID"} />
                <Table.Column dataIndex="name" title={"Nom"} />
                <Table.Column dataIndex="users" title={"Peronnel"}
                    render={(value) => <TextField value={value.length + ` personne${value.length > 1 ? 's' : ''}`} />}
                />
                <Table.Column
                    title={"Actions"}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                            <ShowButton
                                hideText
                                size="small"
                                recordItemId={record.id}
                            />
                        </Space>
                    )}
                />
            </Table>
        </List>
    );
};
