import ReactDOM from 'react-dom/client';

import './styles/animations.css';
import {createBrowserRouter,RouterProvider,Navigate} from 'react-router-dom';
import Login from '@pages/Login';
import Home from '@pages/Home';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import RegisterSelector from './pages/RegisterSelector';
import RegisterStudent from './pages/RegisterStudent';
import RegisterAcademic from './pages/RegisterAcademic';
import RegisterAssistant from './pages/RegisterAssistant';
import HomeAdmin from './pages/admin/HomeAdmin';
import HomeGuardia from '@pages/guardia/HomeGuardia';
import HomeUser from '@pages/HomeUser';
import BicicletasAdmin from './pages/admin/BicicletasAdmin';
import GuardiasAdmin from './pages/admin/GuardiasAdmin';
import HistorialAdmin from './pages/admin/HistorialAdmin';
import PrivateProfile from '@pages/PrivateProfile';
import BicycleProfile from '@pages/BicycleProfile';
import Bicycles from './pages/Bicycles';
import UserReviewHistory from '@pages/UserReviewHistory';
import PendingUserRequests from '@pages/guardia/PendingUserRequests';
import Monitoring from '@pages/guardia/Monitoring';
import IncidentReports from '@pages/guardia/IncidentReports';
import LayoutAdmin from '@components/admin/LayoutAdmin';
import LayoutGuardia from '@components/guardia/LayoutGuardia';
import LayoutUser from "./components/user/LayoutUser";
import GuardiaReviewWrapper from '@components/guardia/GuardiaReviewWrapper.jsx';
import BikerackDetail from '@pages/guardia/BikerackDetail';
import Reservation from '@pages/Reservation';
import './styles/Styles.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <Error404 />,
        children: [
        {
            index: true,
            element: (
            <Navigate
                to='/auth/login'
                replace
            />
            ),
        },
        {
            path: 'auth/login',
            element: <Login />,
        },
        {
            path: 'auth/register',
            element: <RegisterSelector />,
        },
        {
            path: 'auth/register/student',
            element: <RegisterStudent />,
        },
        {
            path: 'auth/register/academic',
            element: <RegisterAcademic />,
        },
        {
            path: 'auth/register/assistant',
            element: <RegisterAssistant />,
        },
        {
            path: 'home',
            element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
            ),
        },
        {
            path: 'home/admin',
            element: (
            <ProtectedRoute>
                <HomeAdmin />
            </ProtectedRoute>
            ),
        },
        {
            path: 'home/guardia',
            element: (
            <ProtectedRoute>
                <HomeGuardia />
            </ProtectedRoute>
            ),
        },
         //RUTAS DE USUARIO
        {
            path: "home/user",
            element: (
                <ProtectedRoute>
                    <LayoutUser />
                </ProtectedRoute>
            ),
            children: 
            [
                {
                    index: true,
                    element: <HomeUser />,
                },
                {
                    path: "privateProfile",
                    element: <PrivateProfile />,
                },
                {
                    path: "bicycles",
                    element: <BicycleProfile />,
                },
                {
                    path: "addBicycles",
                    element: <Bicycles />,
                },
                {
                    path: "reservation",
                    element: <Reservation />,
                },
            ],
        },
        // NUEVAS RUTAS DEL ADMIN
        {
            path: 'home/admin/bicicletas',
            element: (
            <ProtectedRoute>
                <BicicletasAdmin />
            </ProtectedRoute>
            ),
        },
        {
            path: 'home/admin/guardias',
            element: (
            <ProtectedRoute>
                <GuardiasAdmin />
            </ProtectedRoute>
            ),
        },
        {
            path: 'home/admin/historial',
            element: (
            <ProtectedRoute>
                <HistorialAdmin />
            </ProtectedRoute>
            ),
        },
        {
            path: 'home/admin/perfil',
            element: (
                <ProtectedRoute>
                    <LayoutAdmin>
                        <PrivateProfile />
                    </LayoutAdmin>
                </ProtectedRoute>
            ),
        },
        ],
    },
    //!RUTAS DE GUARDIA
    {
        path: 'home/guardia/monitoring',
        element: (
        <ProtectedRoute>
            <LayoutGuardia>
            <Monitoring />
            </LayoutGuardia>
        </ProtectedRoute>
        ),
    },
    {
        path: 'home/guardia/monitoring/:id', //* esta es la vista detallada de un bicicletero
        element: (
        <ProtectedRoute>
            <LayoutGuardia>
            <BikerackDetail />
            </LayoutGuardia>
        </ProtectedRoute>
        ),
    },
    {
        path: 'home/guardia/incident-reports',
        element: (
        <ProtectedRoute>
            <LayoutGuardia>
            <IncidentReports />
            </LayoutGuardia>
        </ProtectedRoute>
        ),
    },
    {
        path: 'home/guardia/pending-requests',
        element: (
        <ProtectedRoute>
            <LayoutGuardia>
            <PendingUserRequests />
            </LayoutGuardia>
        </ProtectedRoute>
        ),
    },

    {
        path: 'home/admin/reviews-history',
        element: (
        <ProtectedRoute>
            <LayoutAdmin>
            <UserReviewHistory />
            </LayoutAdmin>
        </ProtectedRoute>
        ),
    },

    {
        path: 'home/guardia/reviews-history',
        element: (
        <ProtectedRoute>
            <LayoutGuardia>
            <GuardiaReviewWrapper>
                <UserReviewHistory />
            </GuardiaReviewWrapper>
            </LayoutGuardia>
        </ProtectedRoute>
        ),
    },
    {
        path: 'home/guardia/perfil',
        element: (
            <ProtectedRoute>
                <LayoutGuardia>
                    <PrivateProfile />
                </LayoutGuardia>
            </ProtectedRoute>
        ),
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);
