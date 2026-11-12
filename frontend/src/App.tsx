import "./App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
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
import {
  Favourites,
  SavedItems,
  SavedListings,
  SavedOutfits,
} from "./pages/Favourites/Favourites";
import { MyOutfits } from "./pages/Profile/MyOutfits";
import { MyTransactions } from "./pages/Profile/MyTransactions";
import { Messages } from "./pages/Messages/Messages";
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
                  <Route path="outfits" element={<MyOutfits />} />
                  <Route path="transactions" element={<MyTransactions />} />
                </Route>
                <Route path="/favourites" element={<Favourites />}>
                  <Route index element={<Navigate to="items" replace />} />
                  <Route path="items" element={<SavedItems />} />
                  <Route path="listings" element={<SavedListings />} />
                  <Route path="outfits" element={<SavedOutfits />} />
                </Route>
                <Route path="/messages" element={<Messages />} />
                <Route
                  path="/messages/:conversationId"
                  element={<Messages />}
                />
                <Route path="/outfits" element={<Outfits />} />
                <Route
                  path="/outfits/create-outfit"
                  element={<CreateOutfit />}
                />
                <Route path="/outfits/:id" element={<OutfitExpanded />} />
                <Route path="/listings" element={<Listings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* full-screen pages, outside the header and footer */}
            <Route element={<ProtectedRoute />}>
              <Route path="/listings/:id" element={<ListingItemExpanded />} />
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
