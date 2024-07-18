import { 
    Refine,
    GitHubBanner, 
    WelcomePage,
    Authenticated, 
} from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { AuthPage,ErrorComponent
,useNotificationProvider
,ThemedLayoutV2
,ThemedSiderV2,
ThemedTitleV2} from '@refinedev/antd';
import "@refinedev/antd/dist/reset.css";

import { dataProvider } from "./data-provider";
import { App as AntdApp } from "antd"
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import routerBindings, { NavigateToResource, CatchAllNavigate, UnsavedChangesNotifier, DocumentTitleHandler } from "@refinedev/react-router-v6";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { Header } from "./components/header";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { ForgotPassword } from "./pages/forgotPassword";
import { authProvider } from "./authProvider";
import { DriveList } from './pages/drive';
import RefIcon from '@ant-design/icons/lib/icons/ThunderboltOutlined';
import { ServiceEdit, ServiceShow, ServicesList } from './pages/services';




function App() {
    

    
    
    return (
        <BrowserRouter>
        <RefineKbarProvider>
            <ColorModeContextProvider>
            <AntdApp>
            <DevtoolsProvider>
                <Refine dataProvider={dataProvider(import.meta.env.VITE_API_URL)}
                        notificationProvider={useNotificationProvider}
                        routerProvider={routerBindings}
                        authProvider={authProvider} 
                        resources={[
                            {
                                name: "drive",
                                list: "/drive",
                                meta: {
                                    canDelete: true,
                                    label: "Mon Drive"
                                },
                            },
                            {
                                name: "services",
                                list: "/services",
                                show: "/services/details/:id",
                                edit: "/services/modifier/:id",
                                meta: {
                                    hide: true
                                },
                            },
                            {
                                name: "users",
                                list: "/users",
                                meta: {
                                    hide: true
                                },
                            },
                        ]}
                    options={{
                        syncWithLocation: true,
                        warnWhenUnsavedChanges: true,
                        useNewQueryKeys: true,
                            projectId: "KmYMmJ-pPYPuk-f6c0ly",
                        
                    }}
                >
                    <Routes>
                        <Route
                            element={
                                <Authenticated
                                    key="authenticated-inner"
                                    fallback={<CatchAllNavigate to="/login" />}
                                >
                                        <ThemedLayoutV2
                                            Header={Header}
                                            Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                                            Title={({ collapsed }) => (
                                                <ThemedTitleV2
                                                  collapsed={collapsed}
                                                  text="Maxtor Drive"
                                                  icon={<RefIcon className='text-2xl' />}
                                                />
                                              )}
                                        >
                                            <Outlet />
                                        </ThemedLayoutV2>
                                </Authenticated>
                            }
                        >
                            <Route index element={
                                    <NavigateToResource resource="services" />
                            } />
                          <Route path="/drive">
                                <Route index element={<DriveList />} />
                            </Route>
                            <Route path="/services">
                                <Route index element={<ServicesList />} />
                                <Route path='details/:id' element={<ServiceShow />} />
                                <Route path='modifier/:id' element={<ServiceEdit />} />
                            </Route>
                            <Route path="*" element={<ErrorComponent />} />
                        </Route>
                        <Route
                            element={
                                <Authenticated key="authenticated-outer" fallback={<Outlet />}>
                                    <NavigateToResource />
                                </Authenticated>
                            }
                        >
                                <Route path="/login" element={<Login />}  />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                        </Route>
                    </Routes>


                    <RefineKbar />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                </Refine>
            <DevtoolsPanel />
            </DevtoolsProvider>
            </AntdApp>
</ColorModeContextProvider>
        </RefineKbarProvider>
        </BrowserRouter>
      );
};

export default App;
