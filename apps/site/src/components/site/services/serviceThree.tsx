import React from 'react'
import ServiceCard from './serviceCard'
import { servicesTwoData } from '@/db/servicesTwoData'
import SlideUp from '@/utils/animations/slideUp'

const ServiceThree = () => {
    return (
        <section className="services all__services py__130">
            <div className="container">
                <div className="row">
                    {servicesTwoData.map(({ description, id, imgSrc, title }) => (
                        <SlideUp
                            key={id}
                            className="col-xl-4 col-md-6 mb-5"
                            delay={id}
                        >
                            <ServiceCard description={description} title={title} imgSrc={imgSrc} />
                        </SlideUp>
                    ))}
                </div>

                <SlideUp
                    className="custom__pagination"
                >
                    <div className="row">
                        <div className="col-12">
                            <ul className="d-flex justify-content-center">
                                <li>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </li>
                                <li>01</li>
                                <li>02</li>
                                <li>03</li>
                                <li>
                                    <i className="fa-solid fa-arrow-right"></i>
                                </li>
                            </ul>
                        </div>
                    </div>
                </SlideUp>
            </div>
        </section>
    )
}

export default ServiceThree