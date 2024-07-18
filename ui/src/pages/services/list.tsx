import {
    DateField,
    DeleteButton,
    EditButton,
    List,
    MarkdownField,
    ShowButton,
    TextField,
    useTable,
} from "@refinedev/antd";
import { type BaseRecord, useGetIdentity, useMany } from "@refinedev/core";
import { NavigateToResource } from "@refinedev/react-router-v6/.";
import { Button, Space, Spin, Table } from "antd";
import { Navigate } from "react-router-dom";
import ModalAddUser from "../../components/ModalAddUser";
import { useState } from "react";
import ModalAddService from "../../components/ModalAddService";

export const ServicesList = () => {
    const { tableProps, tableQueryResult: { isLoading, refetch } } = useTable({
        resource: "services"
    });
    const { data: user } = useGetIdentity();


    console.log("userrole ", user)

    const [openUpload, setOpen] = useState(false);
  
    const showModal = () => {
        setOpen(true);
    };
  
    const handleCloseUploadModal = () => {
        setOpen(false);
    };

    const [openServiceModal, setServiceModal] = useState(false);
  
    const showServiceModal = () => {
        setServiceModal(true);
    };
  
    const handleCloseSericeModal = () => {
        setServiceModal(false);
    };

    if(!user) return <div className="w-full pt-24 flex justify-center">
        <Spin className="self-center" />
    </div>

    if(user?.role !== 'admin') return <Navigate to="/drive" />


    return (
        <List title="Organisation" 
            headerButtons={[
                <Button className="bg-green-600 text-white" 
                onClick={showModal}
                >Ajouter un nouvel utilisateur</Button>,
                <Button className="bg-green-600 text-white" 
                onClick={showServiceModal}
                >Ajouter un nouveau service</Button>
            ]}
        >
        <ModalAddUser
            open={openUpload}
                handleCancel={handleCloseUploadModal}
                handleSuccess={() => {
                    handleCloseUploadModal()
                    refetch()
                }}
        />

        <ModalAddService
            open={openServiceModal}
                handleCancel={handleCloseSericeModal}
                handleSuccess={() => {
                    handleCloseSericeModal()
                    refetch()
                }}
        />
        
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
