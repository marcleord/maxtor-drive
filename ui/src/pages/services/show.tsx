import {
    DateField,
    MarkdownField,
    NumberField,
    Show,
    TextField,
} from "@refinedev/antd";
import { BaseRecord, useGetIdentity, useMany, useOne, useShow } from "@refinedev/core";
import { Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { TOKEN_KEY } from "../../authProvider";

const { Title } = Typography;

  
export const ServiceShow = () => {
    const { queryResult } = useShow({
      resource: "services"
    });
    const { data, isLoading } = queryResult;

    const record = data?.data;

    const { data: user } = useGetIdentity();

    return (
        <Show isLoading={isLoading}>
            <TextField value={record?.id} />
            <Title level={5}>{"Nom"}</Title>
            <TextField value={record?.name} />
            <Title level={5}>{"Dossier"}</Title>
            {
              user?.role === 'admin' && <TextField value={record?.folder} />
            }

          <Table dataSource={record?.users || []} rowKey="id">
                <Table.Column dataIndex="id" title={"ID"} />
                <Table.Column dataIndex="username" title={"Mail"} />
                <Table.Column dataIndex="fullname" title={"Nom"} />
            </Table>
        </Show>
    );
};
