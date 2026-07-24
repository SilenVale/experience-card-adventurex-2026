import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import CardDetailPage from "../pages/card-detail/page";
import CreateCardPage from "../pages/create-card/page";
import CommunityPage from "../pages/community/page";
import MyCardsPage from "../pages/my-cards/page";
import AuthCallbackPage from "../pages/auth-callback/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/card/:cardId",
    element: <CardDetailPage />,
  },
  {
    path: "/create",
    element: <CreateCardPage />,
  },
  {
    path: "/community",
    element: <CommunityPage />,
  },
  {
    path: "/my-cards",
    element: <MyCardsPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
