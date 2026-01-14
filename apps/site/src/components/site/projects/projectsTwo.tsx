import React from 'react'
import { projectsTwoData } from '@/db/projectsTwoData'
import ProjectCard from './projectCard'
import SlideDown from '@/utils/animations/slideDown'
import SlideUp from '@/utils/animations/slideUp'
import Link from 'next/link'

const ProjectsTwo = () => {
    return (
        <section className="projects__2 py__130">
            <div className="container">
                <SlideDown className="d-lg-flex justify-content-between align-items-center">
                    <h1 className="title">
                        Digital marketing agencies create &amp; manage the advertising campaign
                        across various
                    </h1>
                    <Link href="/projects" className="circle circle__black mt-4 mt-lg-0">
                        <img src="/icons/arrow-up-rignt-black.svg" alt="img" />
                        <span>View All Projects</span>
                    </Link>
                </SlideDown>

                <div className="projects__2_wapper">
                    <div className="row">
                        {projectsTwoData.slice(0, 3).map(({ categories, id, imgSrc, title }) => (
                            <SlideUp
                                key={id}
                                className={`col-xl-4 col-md-6 mb-5 mb-xl-0 ${id === 3 ? '' : 'mb-xl-0'}`}
                                delay={id}
                            >
                                <ProjectCard categories={categories} imgSrc={imgSrc} title={title} className={id === 2 ? 'two' : id === 3 ? 'three' : ''} />
                            </SlideUp>
                        ))}
                    </div>
                </div>
            </div>
        </section>


    )
}

export default ProjectsTwo