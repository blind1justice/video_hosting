import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Videos from "./pages/Videos";
import UploadVideo from "./pages/UploadVideo";
import PublicProfile from "./pages/PublicProfile";
import VideoDetail from "./pages/VideoDetail";
import Reports from "./pages/Reports";
import Preferences from "./pages/Preferences";


export const moderatorRoutes = [
    {
        path: '/reports',
        Component: Reports
    }
]


export const authRoutes = [
    {
        path: '/profile',
        Component: Profile
    },
    {
        path: '/preferences',
        Component: Preferences
    },
    {
        path: 'upload-video',
        Component: UploadVideo
    }
]


export const publicRoutes = [
    {
        path: '/login',
        Component: Auth
    },
    {
        path: '/register',
        Component: Auth
    },
    {
        path: '/videos/:id',
        Component: VideoDetail
    },
    {
        path: '/videos',
        Component: Videos
    },
    {
        path: '/users/:id',
        Component: PublicProfile
    }
]
