import Controller from "./components/Controller";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function Home() {



  return (
    <div className="h-dvh flex flex-col">
      <Header></Header>
      <div className="container mx-auto">
        <Controller></Controller>
      </div>
      <Footer></Footer>
    </div>

  );
}
