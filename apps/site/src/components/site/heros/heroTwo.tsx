import SlideUp from '@/utils/animations/slideUp'
import Link from 'next/link'
import React from 'react'

const HeroTwo = () => {
    return (
        <section className="banner2 overflow-hidden">
            <div className="container position-relative">
                <div className="row">
                    <div className="col-lg-7">
                        <div className="banner__content">
                            <SlideUp className="banner__content_title banner2__title">
                                <h1>Digital agency</h1>
                                <h1>For your global business.</h1>
                                <p>
                                    Learn about how them you went down prying the wedding ring off
                                    his cold, dead finger. I don’t know what you did, Fry, but
                                    once again,
                                </p>
                            </SlideUp>
                            <SlideUp className="buttons d-sm-flex align-items-center">
                                <Link href={"/services"} className="common__btn buttons_file">
                                    <span>View Our Service</span>
                                    <img src="/icons/arrow-up-rignt-black.svg" alt="img" />
                                </Link>
                            </SlideUp>
                            <SlideUp className="banner__content_number banner2__number d-flex justify-content-between">
                                <div>
                                    <h4>45+</h4>
                                    <p>Years Experience</p>
                                </div>
                                <div>
                                    <h4>99%</h4>
                                    <p>Satisfaction Rate</p>
                                </div>
                                <div>
                                    <h4>393k</h4>
                                    <p>Our Global Clients</p>
                                </div>
                            </SlideUp>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="banner__right" />
                    </div>
                </div>
            </div>
        </section>

    )
}

export default HeroTwo