# Assessing Business Loan Risks with MongoDB Multimodal Capabilities and GenAI

Business loans are a cornerstone of banking operations, providing significant benefits to both financial institutions and the broader economy. In 2023, the value of commercial and industrial loans at commercial banks in the United States alone reached nearly **2.8 trillion U.S. dollars**. However, these loans also present unique challenges and risks that banks must navigate. Besides credit risk, where the borrower may default on the loan leading to financial losses, banks also face business risk, where economic downturns or sector-specific declines can impact borrowers' business and in turn their ability to repay. 


### Requirements

The tech stack is :
- Node JS microservices server/s
- Python 3
- MongoDB Atlas/Enterprise
- [Docker desktop](https://www.docker.com/products/docker-desktop/) (optional)
- Google Maps API
- [Fireworks.ia](https://fireworks.ai/)
- [De-identification](https://www.d-id.com/)

> [!Warning]
> This demo uses several **paying services** which are not included in the demo such as : Geospacial indexes in MongoDB, [Google's Reverse geocoding APIs](https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding) and [D-ID's talk streams](https://docs.d-id.com/reference/startconnection).
> Also this demo uses Fireworks.ai's LLMs, and therefore will need an API key, which you can get by signing up for free with your Google account [here](https://fireworks.ai/login). 

> [!Note]
> D-ID is a generative AI-powered interactions and content creation platform. This is the platform that avatar logic was built on. While being remarkable and very eye-catching it is a paying service that doesn’t use MongoDB. We therefore added another [Github branch](https://github.com/mongodb-industry-solutions/Risk-assessor/tree/main) which excluded the avatar logic.

## Installation of the Demo

To install the demo please follow these steps:

- [Create an Atlas Account](https://www.mongodb.com/docs/atlas/tutorial/create-atlas-account/)
- [Create a **dedicated** cluster](https://www.mongodb.com/docs/atlas/tutorial/create-new-cluster/)
- [Setup the dataset and backend](./backend/)
- [Installation of the frontend](./frontend/)
- Executing the demo with docker

To build the Docker images and start the services, run the following command:

```
make build
```

To remove all images and containers associated with the application, execute:

```
make clean
```

## Summary

This demo showcases how to assess business loan risks using MongoDB's multimodal capabilities and GenAI, leveraging a tech stack that includes Node.js, Python, MongoDB Atlas, Docker, Google Maps API, and Fireworks.ai.

In the previous sections, we explored how to:

- Create a dedicated cluster
- How to use Geospatial data in MongoDB

Are you prepared to harness these capabilities for your projects? Should you encounter any roadblocks or have questions, our vibrant [developer forums](https://www.mongodb.com/community/forums/) are here to support you every step of the way. Or if you prefer to contact us directly at [industry.solutions@mongodb.com](mailto:industry.solutions@mongodb.com).

You can also dive into the following resources:

- [Assessing Business Loan Risks with MongoDB Multimodal Capabilities and GenAI](https://docs.google.com/document/d/1CdSKK7aYLl-HrRhYriaYbudp-UepfojKD-Iy1uNYu64/edit) - Link to be updated

## Disclaimer

This product is not a MongoDB official product. Use at your own risk!

## Authors

- Wei You Pan, Global Director, Financial Industry Solutions, MongoDB
- Angie Guemes, Senior Specialist, Industry Solutions, MongoDB
- Paul Claret, Senior Specialist for Financial Services, Industry Solutions, MongoDB