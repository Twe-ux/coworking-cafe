import { membersProgramData } from "@/db/membersProgram/memberProgramData";
import SlideDown from "@/utils/animations/slideDown";
import SlideUp from "@/utils/animations/slideUp";
import Link from "next/link";
import MemberProgramCard from "./membersProgramCard";

const MembersProgram = () => {
  return (
    <section className="members members__2 py__90 ">
      <div className="container position-relative ">
        <SlideDown className="">
          <h1 className="title text-white mb-4">
            Devenez membre. Gagnez des récompenses.
          </h1>
          <p className="mt-4 mt-lg-0">
            Chaque passage chez nous compte (littéralement).
            <br /> Vos cafés, vos journées de travail, vos pauses et vos
            réunions se transforment en points… et vos points en cadeaux.
            <br /> Plus vous venez, plus on vous gâte ✨
          </p>
        </SlideDown>
        {/*  */}
        <div className="members__wapper members__2_wapper">
          <div className="row">
            {membersProgramData
              .slice(0, 3)
              .map(({ description, id, icon, underDescription, title }) => (
                <SlideUp
                  key={id}
                  className="col-xl-4 col-md-6 mb-5 mb-xl-0"
                  delay={id}
                >
                  <MemberProgramCard
                    description={description}
                    title={title}
                    icon={icon}
                    underDescription={underDescription}
                    className={id === 2 ? "two" : id === 3 ? "three" : ""}
                  />
                </SlideUp>
              ))}
            <div className="row members__2_row pt-4">
              <div className="col-12">
                <p>
                  Tu souhaites créer ton compte Membre ?
                  <Link href="/auth/register#register"> Clique ici !</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembersProgram;
