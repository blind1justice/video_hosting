import React, { useContext } from "react";
import {Navigate, Routes, Route} from "react-router-dom";
import { moderatorRoutes, authRoutes, publicRoutes } from "../routes";
import { Context } from "..";

const AppRouter = () => {
    const {user} = useContext(Context); 


    return (
        <Routes>
            {user.isAuth && (user.user.role === "moderator" || user.user.role === "admin")
            && moderatorRoutes.map(({path, Component}) => 
                <Route key={path} path={path} element={<Component />} exact />
            )}
            {user.isAuth && authRoutes.map(({path, Component}) => 
                <Route key={path} path={path} element={<Component />} exact />
            )}
            {publicRoutes.map(({path, Component}) => 
                <Route key={path} path={path} element={<Component />} exact />
            )}
            <Route path="*" element={<Navigate to={'/videos'} />}/>
        </Routes>
    )
}

export default AppRouter;
