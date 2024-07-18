import { Edit, useForm, useSelect } from "@refinedev/antd";
import MDEditor from "@uiw/react-md-editor";
import { Form, Input, Select, Space } from "antd";
import React from "react";

export const ServiceEdit = () => {
    const { formProps, saveButtonProps, queryResult, formLoading } = useForm({
    });
    const service = queryResult?.data?.data

    const blogPostsData = queryResult?.data?.data;

    const { selectProps: usersSelectProps } = useSelect({
        resource: "users",
        queryOptions: {
            // enabled: !!blogPostsData?.category?.id,
        },
        optionLabel: 'fullname',
        optionValue: 'id'
    });
    console.log("usersSelectProps ", service?.users)

    return (
        <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
            <Form {...formProps} 
            layout="vertical">
                <Form.Item
                    label={"Nom"}
                    name={["name"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label={"Dossier (lien absolu)"}
                    name={["folder"]}
                    rules={[
                        {
                            required: true,
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                {
                    service?.users && (
                        <Form.Item
                            label={"Personnel"}
                            name={'users'}
                            initialValue={service?.users?.map(u => u.id)}
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="select one country"
                                {...usersSelectProps}
                                // defaultValue={['china']}
                                // // onChange={handleChange}
                                // options={usersSelectProps.options}
                                // optionRender={(option) => (
                                // <Space>
                                //     <span role="img" aria-label={option.data.label}>
                                //     {option.data.emoji}
                                //     </span>
                                //     {option.data.desc}
                                // </Space>
                                // )}
                            />
                        </Form.Item>
                    )
                }
            </Form>
        </Edit>
    );
};
