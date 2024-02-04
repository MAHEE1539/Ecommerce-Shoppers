import React from "react";
import './DescriptionBox.css';

const DescriptionBox = ()=>{
    return(
        <div className="descriptionbox">
            <div className="descriptionbox-navigator">
                <div className="descriptionbox-nav-box">Description</div>
                <div className="descriptionbox-nav-box fade">Reviews (122)</div>
            </div>
            <div className="descriptionbox-description">
                <p>
                An ecommerce website is a digital storefront on the internet that facilitates 
                sales transactions between buyers and sellers.2 It acts as a hub of information 
                about a company and what they sell, providing product listings, eCommerce blog content, 
                company history, and contact information.1 An ecommerce platform is a service that enables 
                individuals, creators, and businesses of all sizes to sell online and in person through a brick-and-mortar store.
                </p>
                <p>
                It acts as a hub of information about a company and what they sell, 
                providing product listings, eCommerce blog content, company history, and contact information 
                </p>
            </div>
        </div>
    )
}
export default DescriptionBox