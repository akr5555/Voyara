import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import UpcomingTrips from "@/components/UpcomingTrips";
import PopularDestinations from "@/components/PopularDestinations";
import TravelProjects from "@/components/TravelProjects";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import VegaAI from "@/components/VegaAI";

const Index = () => {
  return (
    <>
      <LoadingScreen />
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSlider />
          <UpcomingTrips />
          <PopularDestinations />
          <TravelProjects />
          <VegaAI />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
