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
import { type BaseRecord, useMany } from "@refinedev/core";
import { Breadcrumb, Button, Divider, Layout, Radio, Space, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { handleAPIError } from "../../utils";
import useNotification from "antd/es/notification/useNotification";
import ModalUploadFile from "../../components/ModalUploadFile";
import axios from "axios";
import { TOKEN_KEY } from "../../authProvider";

const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: []) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

export const DriveList = () => {
    const [queryParams, setSearchParams] = useSearchParams()
    const tab: string | null = queryParams.get('path')
    console.log("path :: ", tab)

    const { search: browserFolderURL } = useLocation();
    // console.log("location ", location)
    const [path, setPath] = useState({
        previous: null,
        current: tab || '/',
        seed: Math.random(),
    })
    const [seed, setSeed] = useState(path.seed)

    const notify = useNotification()

    const { tableProps, tableQueryResult } = useTable({
        syncWithLocation: true,
        filters: {
            permanent: [
                {
                    field: 'folder',
                    operator: 'eq',
                    value: path.current
                }
            ]
        },
        errorNotification(error, values, resource) {
            console.log("Error while fetcinh ")
            // notify
            // handleAPIError(error, notify[0])
            // setPath(prev => ({ previous: prev.current, current: prev.previous }))
            return {
                type: 'error',
                message: (error?.response?.data?.error && typeof error?.response?.data?.error === "string") ? error?.response?.data?.error : "Une erreur s'est produite !"
            }
        },
        successNotification(data, values, resource) {
            

        },
    });
    const data = tableProps?.dataSource
    const isFetching = tableQueryResult?.isLoading || tableQueryResult?.isFetching || tableQueryResult?.isRefetching

    const [selectionType, setSelectionType] = useState<'checkbox' | 'radio'>('checkbox');



    // const resolveTabIndex = () => {
    //     if(!tab) return 0
    //     return tabMapping[tab] || 0
    // }

    useEffect(() => {
        if(!tab) {
            setSearchParams({ path: '/' })
        }
    }, [])

    // useMemo(() => {
    //     if(tableQueryResult.isError) {
    //         console.log("Detected error ")
    //         if(path.seed != seed) {

    //         }
    //     }
    // }, [tableQueryResult.isError])

    const handleEnterFolder = () => {
        console.log("handle enter path")
        if(!tab) {
            console.log("Aborted because null")
            setSearchParams({ path: '/' })
            return
        }
        // if(isFetching) {
        //     console.log("Aborted because isfetching", tableQueryResult.isLoading, tableQueryResult.isFetching, tableQueryResult.isRefetching ) 
        //     return
        // }
        // const folder = record.name
        // if(path.current.endsWith(folder)) return
        // const newPath = path.current + (path.current.endsWith("/") ? '' : '/') + folder
        const newPath = tab
        console.log("YES will update data with path == ", newPath)
        // if(newPath == path.current) {
        //     console.error("Same paths")
        //     return
        // }
        // setSearchParams({
        //     path: newPath
        // })
        setPath(prev => ({
            ...prev,
            seed: Math.random(),
            previous: prev.current,
            current: newPath
        }))
        console.log("New tab ", path)
        tableQueryResult.refetch()
    }

    const handleDownload = async () => {
        try {
          const downloadPayload = { files: selectedFiles.map( f => tab + (tab?.endsWith("/") ? '' : '/') + f.name ) }
          const fileNames = selectedFiles.map(f => f.name).join(",")
          console.log("downloadPayload :: ", downloadPayload)
          

            const rawToken = localStorage.getItem(TOKEN_KEY);
            const parsedAuth = JSON.parse(rawToken)
            const token = parsedAuth.token
            console.log("token ", token)

          const response = await axios.post ( import.meta.env.VITE_API_URL + "/download", downloadPayload, {
            headers: {
              Authorization: token
            },
            responseType: 'blob' // important for binary data
          });
    
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          console.log("fileNames ", typeof fileNames, fileNames)
          link.setAttribute('download', fileNames.includes(',') ? 'files.zip' : fileNames);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error("Error downloading file:", error);
        }
      };
    
    
    useMemo(handleEnterFolder, [tab])

    const navigate = useNavigate()
    const [openUpload, setOpenUpload] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([])
  
    const showModal = () => {
        setOpenUpload(true);
    };
  
    const handleCloseUploadModal = () => {
        setOpenUpload(false);
    };

    return (
        <div className="w-full">
                <ModalUploadFile 
                    basePath={tab}
                    open={openUpload}
                    handleCancel={handleCloseUploadModal}
                    handleSuccess={() => {
                        handleCloseUploadModal()
                        tableQueryResult.refetch()
                    }}
                />
            <div className="w-full flex justify-between" >
                <Breadcrumb style={{ margin: '16px 0', }}
                    separator="/"
                >
                <Breadcrumb.Item 
                    className="hover:bg-slate-200  px-4 py-2 rounded-lg cursor-pointer"
                    onClick={() => navigate("/drive?path=/")} >Index</Breadcrumb.Item>
                {
                        path.current?.split("/")?.map(
                            (folder, index) => {
                                if(!folder) return
                                return (
                                    <Breadcrumb.Item
                                        // style={{ 
                                        //     color: "blue", cursor: 'pointer', paddingLeft: 5, paddingRight: 5, borderWidth: '1px', borderRadius: 5, borderColor: 'gray' 
                                        // }} 
                                        className="hover:bg-slate-200  px-4 py-2 rounded-lg cursor-pointer"
                                        onClick={() => {
                                            // navigate(`/drive?path=${path.current + (path.current?.endsWith("/") ? '' : '/') + record.name}`)
                                            const folder = path.current?.split("/")?.slice(0, index + 1).reduce((prev, current) => {
                                                if(!current) return prev
                                                return prev + "/" + current
                                            } , '')
                                            console.log("Move to folder ", folder)
                                        }}
                                    >
                                        {folder}
                                    </Breadcrumb.Item>
                                )
                            }
                        )
                    }
                </Breadcrumb>

                <Button onClick={showModal} type="dashed" className="bg-blue-600 text-white" >Téléverser</Button>
            </div>
            <List 
                title=" "
                headerButtons={[
            ]}
            >
                {
                    selectedFiles.length > 0 && (
                        <Button
                            onClick={handleDownload}
                        >Télcharger {selectedFiles.length > 1 && `${selectedFiles.length} éléments`} </Button>
                    ) 
                }

                <Divider />
                
                <Table
                    rowKey="name"
                    rowSelection={{
                        type: "checkbox",
                        onChange: (selectedRowKeys: React.Key[], selectedRows: []) => {
                            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                            setSelectedFiles(selectedRows)
                        },
                        getCheckboxProps: (record: any) => ({
                            disabled: record.name === 'Disabled User', // Column configuration not to be checked
                            name: record.name,
                          }),
                    }}
                    {...tableProps} 
                    >
                <Table.Column dataIndex="name" title={"Nom"}
                    render={(value, record) => {
                        if(record.type == 2) return <TextField 
                        value={value} 
                        copyable={false}
                        style={{ 
                            color: "blue", cursor: 'pointer', paddingLeft: 5, paddingRight: 5, borderWidth: '1px', borderRadius: 5, borderColor: 'gray' 
                        }} 
                        onClick={() => navigate(`/drive?path=${path.current + (path.current?.endsWith("/") ? '' : '/') + record.name}`)}
                        />
                        return <TextField copyable={false} value={value} />
                    }}
                />

                    <Table.Column
                        dataIndex={["createdAt"]}
                        title={"Créé le"}
                        render={(value: any) => <DateField italic value={value} />}
                    />
                    <Table.Column
                        dataIndex={["updatedAt"]}
                        title={"Dernière modification"}
                        render={(value: any) => <DateField italic value={value} />}
                    />
                    <Table.Column
                        dataIndex={["size"]}
                        title={"Taille"}
                        render={(value: any) => <TextField value={(value / 1024).toFixed(2) + " MB"} />}
                    />
                    {/* <Table.Column
                        title={"Actions"}
                        dataIndex="actions"
                        render={(_, record: BaseRecord) => (
                            <Space>
                                <EditButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                                <ShowButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                                <DeleteButton
                                    hideText
                                    size="small"
                                    recordItemId={record.id}
                                />
                            </Space>
                        )}
                    /> */}
                </Table>
            </List>
        </div>
    );
};
