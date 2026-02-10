import Image from "next/image";
import React from 'react';

interface PartnerProps {
    data: string[];
    className?: string;
}

const Partner = ({data, className = ''}: PartnerProps) => {
    return (
        <div className={`partner ${className}`}>
            <div className="partner__wapper">
                <div className="partner__content">
                    {data.map((logoSrc, index) => (
                        <div className="slide" key={index}>
                            <Image
                                src={logoSrc}
                                alt={`Partenaire CoworKing Café Anticafé Strasbourg ${index + 1}`}
                                width={120}
                                height={60}
                                loading="lazy"
                                quality={85}
                                className="partner__logo"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Partner;