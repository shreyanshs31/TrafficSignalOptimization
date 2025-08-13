import NavBar from "./NavBar"
import Header from "./Header"
import Main from "./Main"
import bgImg from "../assets/bg.png"
export default function Home() {
    return (
        <>
            <div className="flex flex-col items-center min-h-screen text-neutral-200 bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${bgImg})`}}>
                <NavBar />
                <Header />
            </div>
            <Main />
        </>
    )
}