import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Auth/Login";
import { Register } from "./pages/Auth/Register";
import { Wardrobe } from "./pages/Wardrobe/Wardrobe";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ClothingItemExpanded } from "./pages/Wardrobe/ClothingItemExpanded";
import { Listings } from "./pages/Listings/Listings";
import { ListingItemExpanded } from "./pages/Listings/ListingItemExpanded";
import { Profile } from "./pages/Profile/Profile";
import { MyFavourites } from "./pages/Profile/MyFavourites";
import { MyOutfits } from "./pages/Profile/MyOutfits";
import { MyTransactions } from "./pages/Profile/MyTransactions";
import { MyMessages } from "./pages/Profile/MyMessages";
import { NotFound } from "./pages/NotFound/NotFound";
import { Outfits } from "./pages/Outfits/Outfits";
import { CreateOutfit } from "./pages/Outfits/CreateOutfit";
import { OutfitExpanded } from "./pages/Outfits/OutfitExpanded";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/wardrobe" element={<Wardrobe />} />
                <Route
                  path="/wardrobe/:id"
                  element={<ClothingItemExpanded />}
                />
                <Route path="/profile" element={<Profile />}>
                  <Route path="favourites" element={<MyFavourites />} />
                  <Route path="outfits" element={<MyOutfits />} />
                  <Route path="transactions" element={<MyTransactions />} />
                  <Route path="messages" element={<MyMessages />} />
                  <Route
                    path="messages/:conversationId"
                    element={<MyMessages />}
                  />
                </Route>
                <Route path="/outfits" element={<Outfits />} />
                <Route
                  path="/outfits/create-outfit"
                  element={<CreateOutfit />}
                />
                <Route path="/outfits/:id" element={<OutfitExpanded />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/listings/:id" element={<ListingItemExpanded />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
