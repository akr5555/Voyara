import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import UpcomingTrips from "@/components/UpcomingTrips";
import PopularDestinations from "@/components/PopularDestinations";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <UpcomingTrips />
        <PopularDestinations />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
