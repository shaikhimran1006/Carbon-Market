import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@carbon.market" },
    update: {},
    create: {
      email: "admin@carbon.market",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const seller1 = await prisma.user.upsert({
    where: { email: "sarah@green.org" },
    update: {},
    create: {
      email: "sarah@green.org",
      name: "Sarah Green",
      password: hashedPassword,
      role: "SELLER",
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "mike@solarpower.com" },
    update: {},
    create: {
      email: "mike@solarpower.com",
      name: "Mike Solar",
      password: hashedPassword,
      role: "SELLER",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      name: "John Doe",
      password: hashedPassword,
      role: "BUYER",
    },
  });

  console.log("✅ Users created");

  // Project data
  const projectsData = [
    {
      title: "Amazon Rainforest Conservation",
      description:
        "Protecting 50,000 hectares of pristine Amazon rainforest from deforestation. This project works with local indigenous communities to preserve biodiversity and maintain critical carbon sinks. The forest stores an estimated 2 million tons of carbon and is home to over 1,000 species of plants and animals.",
      methodology:
        "REDD+ (Reducing Emissions from Deforestation and Forest Degradation) methodology verified by Verra. The project uses satellite monitoring and ground patrols to prevent illegal logging and land conversion.",
      category: "REFORESTATION",
      standard: "VCS",
      pricePerCredit: 18.5,
      totalCredits: 100000,
      availableCredits: 87500,
      rating: 4.8,
      reviewCount: 124,
      location: "Amazonas State",
      country: "Brazil",
      latitude: -3.4653,
      longitude: -62.2159,
      imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
        "https://images.unsplash.com/photo-1580092864285-8c47e6d56a12?w=800",
        "https://images.unsplash.com/photo-1511497584788-876760111969?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 15, 1, 8]),
      sellerId: seller1.id,
    },
    {
      title: "Kenya Solar Energy Initiative",
      description:
        "A 50MW solar photovoltaic installation providing clean energy to over 100,000 households in rural Kenya. This project displaces diesel generators and kerosene lamps, reducing CO2 emissions while improving quality of life.",
      methodology:
        "Clean Development Mechanism (CDM) methodology for grid-connected renewable energy. Emissions reductions calculated based on displaced fossil fuel generation.",
      category: "RENEWABLE_ENERGY",
      standard: "Gold Standard",
      pricePerCredit: 12.0,
      totalCredits: 50000,
      availableCredits: 42000,
      rating: 4.6,
      reviewCount: 89,
      location: "Turkana County",
      country: "Kenya",
      latitude: 2.8667,
      longitude: 36.0833,
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800",
      ]),
      sdgGoals: JSON.stringify([7, 13, 1, 8]),
      sellerId: seller2.id,
    },
    {
      title: "Indonesian Mangrove Restoration",
      description:
        "Restoring 10,000 hectares of degraded mangrove ecosystems along the coast of Sumatra. Mangroves store up to 4x more carbon than terrestrial forests and provide critical habitat for marine life.",
      methodology:
        "Verified Carbon Standard (VCS) methodology for tidal wetland restoration. Includes both above-ground biomass and blue carbon sequestration.",
      category: "OCEAN_CONSERVATION",
      standard: "VCS",
      pricePerCredit: 25.0,
      totalCredits: 30000,
      availableCredits: 28000,
      rating: 4.9,
      reviewCount: 67,
      location: "Riau Province",
      country: "Indonesia",
      latitude: 1.5,
      longitude: 102.5,
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 14, 15, 6]),
      sellerId: seller1.id,
    },
    {
      title: "Scottish Wind Farm",
      description:
        "A 75MW offshore wind installation in the North Sea providing clean electricity to Scottish homes. This project demonstrates the viability of floating wind turbine technology.",
      methodology:
        "Gold Standard methodology for grid-connected wind power. Verified emissions reductions from displaced natural gas generation.",
      category: "RENEWABLE_ENERGY",
      standard: "Gold Standard",
      pricePerCredit: 14.0,
      totalCredits: 60000,
      availableCredits: 52000,
      rating: 4.5,
      reviewCount: 45,
      location: "Aberdeen Coast",
      country: "United Kingdom",
      latitude: 57.1497,
      longitude: -2.0943,
      imageUrl: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800",
        "https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800",
      ]),
      sdgGoals: JSON.stringify([7, 9, 13]),
      sellerId: seller2.id,
    },
    {
      title: "Costa Rica Reforestation",
      description:
        "Planting native tree species on 5,000 hectares of degraded pastureland, creating wildlife corridors and restoring ecosystem services. Working with local communities to ensure long-term forest stewardship.",
      methodology:
        "VCS Afforestation/Reforestation methodology with 40-year crediting period. Includes biodiversity monitoring and community engagement.",
      category: "REFORESTATION",
      standard: "VCS",
      pricePerCredit: 22.0,
      totalCredits: 40000,
      availableCredits: 35000,
      rating: 4.7,
      reviewCount: 78,
      location: "Guanacaste Province",
      country: "Costa Rica",
      latitude: 10.4976,
      longitude: -85.3534,
      imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800",
        "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 15, 1, 8]),
      sellerId: seller1.id,
    },
    {
      title: "Indian Clean Cookstoves",
      description:
        "Distributing 50,000 efficient cookstoves to rural households in Rajasthan, reducing wood fuel consumption by 60% and improving indoor air quality for families.",
      methodology:
        "Gold Standard methodology for improved cookstove projects. Monitors fuel savings through regular household surveys and stove inspections.",
      category: "COMMUNITY",
      standard: "Gold Standard",
      pricePerCredit: 8.5,
      totalCredits: 25000,
      availableCredits: 18500,
      rating: 4.4,
      reviewCount: 156,
      location: "Rajasthan",
      country: "India",
      latitude: 26.9124,
      longitude: 75.7873,
      imageUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800",
      ]),
      sdgGoals: JSON.stringify([3, 7, 13, 5]),
      sellerId: seller2.id,
    },
    {
      title: "Canadian Boreal Forest Protection",
      description:
        "Protecting 100,000 hectares of pristine boreal forest in Northern Ontario from logging. The boreal forest is one of the world's largest carbon sinks.",
      methodology:
        "REDD+ methodology adapted for temperate forests. Includes Indigenous partnership agreements and traditional land management practices.",
      category: "REFORESTATION",
      standard: "ACR",
      pricePerCredit: 20.0,
      totalCredits: 80000,
      availableCredits: 75000,
      rating: 4.6,
      reviewCount: 34,
      location: "Northern Ontario",
      country: "Canada",
      latitude: 50.0,
      longitude: -85.0,
      imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511497584788-876760111969?w=800",
        "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 15]),
      sellerId: seller1.id,
    },
    {
      title: "Australian Kelp Farming",
      description:
        "Cultivating giant kelp forests along the coast of Tasmania. Kelp absorbs CO2 5x faster than land-based forests and provides habitat for marine biodiversity.",
      methodology:
        "Emerging blue carbon methodology for macroalgae cultivation. Pioneer project establishing protocols for kelp-based carbon credits.",
      category: "OCEAN_CONSERVATION",
      standard: "VCS",
      pricePerCredit: 35.0,
      totalCredits: 15000,
      availableCredits: 14500,
      rating: 4.9,
      reviewCount: 23,
      location: "Tasmania",
      country: "Australia",
      latitude: -42.8821,
      longitude: 147.3272,
      imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 14, 12]),
      sellerId: seller2.id,
    },
    {
      title: "Moroccan Solar Farm",
      description:
        "A concentrated solar power plant with thermal storage, providing 24/7 clean electricity to the Moroccan grid. Part of the world's largest solar complex.",
      methodology:
        "CDM methodology for solar thermal power with storage. Accounts for both direct generation and grid stability benefits.",
      category: "RENEWABLE_ENERGY",
      standard: "Gold Standard",
      pricePerCredit: 11.0,
      totalCredits: 60000,
      availableCredits: 55000,
      rating: 4.5,
      reviewCount: 52,
      location: "Ouarzazate",
      country: "Morocco",
      latitude: 30.9335,
      longitude: -6.937,
      imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
      ]),
      sdgGoals: JSON.stringify([7, 9, 13]),
      sellerId: seller2.id,
    },
    {
      title: "Colombian Coffee Agroforestry",
      description:
        "Converting 3,000 hectares of sun-grown coffee to shade-grown agroforestry systems. Native trees provide habitat while improving coffee quality and farmer incomes.",
      methodology:
        "Verra Agriculture Forestry methodology. Measures carbon sequestration in shade trees and improved soil carbon from organic practices.",
      category: "AGRICULTURE",
      standard: "VCS",
      pricePerCredit: 16.0,
      totalCredits: 20000,
      availableCredits: 17500,
      rating: 4.7,
      reviewCount: 41,
      location: "Huila Department",
      country: "Colombia",
      latitude: 2.5359,
      longitude: -75.5277,
      imageUrl: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
      ]),
      sdgGoals: JSON.stringify([2, 13, 15, 1, 8]),
      sellerId: seller1.id,
    },
    {
      title: "Maldives Blue Carbon",
      description:
        "Protecting and restoring seagrass meadows across 50 atolls. Seagrass ecosystems store carbon for millennia and protect coastlines from erosion.",
      methodology:
        "Verra Blue Carbon methodology for seagrass conservation. Includes community-based marine protected area management.",
      category: "OCEAN_CONSERVATION",
      standard: "VCS",
      pricePerCredit: 30.0,
      totalCredits: 12000,
      availableCredits: 11000,
      rating: 4.8,
      reviewCount: 29,
      location: "North Malé Atoll",
      country: "Maldives",
      latitude: 4.1755,
      longitude: 73.5093,
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      ]),
      sdgGoals: JSON.stringify([13, 14, 6]),
      sellerId: seller2.id,
    },
    {
      title: "Norwegian Direct Air Capture",
      description:
        "Pioneering direct air capture facility powered by hydroelectric energy. Captures CO2 directly from the atmosphere and stores it permanently in basalt rock formations.",
      methodology:
        "Emerging methodology for engineered carbon removal. Third-party verified capture and permanent geological storage.",
      category: "INDUSTRIAL",
      standard: "VCS",
      pricePerCredit: 250.0,
      totalCredits: 5000,
      availableCredits: 4800,
      rating: 4.9,
      reviewCount: 18,
      location: "Hellisheiði",
      country: "Norway",
      latitude: 64.0388,
      longitude: -21.4007,
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
      ]),
      sdgGoals: JSON.stringify([9, 13]),
      sellerId: seller1.id,
    },
  ];

  // Create projects
  for (const projectData of projectsData) {
    const project = await prisma.project.create({
      data: projectData,
    });

    // Create price history for last 6 months
    const basePrice = projectData.pricePerCredit;
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      await prisma.priceHistory.create({
        data: {
          projectId: project.id,
          price: Math.round(basePrice * (1 + variation) * 100) / 100,
          date: date,
        },
      });
    }

    // Create some reviews
    const reviewTitles = [
      "Excellent project with real impact",
      "Great transparency and verification",
      "Highly recommended for offsetting",
    ];

    const reviewComments = [
      "I've been following this project for a year and the impact reports are impressive. The team is responsive and the verification process is rigorous.",
      "Clear documentation, verified methodology, and tangible results. Exactly what I look for in a carbon credit project.",
      "The community engagement aspect really sets this apart. Not just carbon reduction but real social impact.",
    ];

    const numReviews = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numReviews; i++) {
      await prisma.review.create({
        data: {
          projectId: project.id,
          userId: buyer.id,
          rating: Math.floor(Math.random() * 3) + 8, // 8-10
          title: reviewTitles[i],
          comment: reviewComments[i],
          helpfulCount: Math.floor(Math.random() * 20),
        },
      });
    }
  }

  console.log("✅ Projects created with price history and reviews");

  // Get all projects for creating orders
  const allProjects = await prisma.project.findMany();

  // Create multiple orders for the buyer to show dashboard/portfolio data
  const buyerOrders = [
    { projectIndex: 0, quantity: 50, daysAgo: 45 },
    { projectIndex: 1, quantity: 25, daysAgo: 30 },
    { projectIndex: 2, quantity: 100, daysAgo: 25 },
    { projectIndex: 4, quantity: 35, daysAgo: 15 },
    { projectIndex: 5, quantity: 20, daysAgo: 7 },
    { projectIndex: 3, quantity: 15, daysAgo: 3 },
  ];

  for (const orderData of buyerOrders) {
    const project = allProjects[orderData.projectIndex];
    if (project) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - orderData.daysAgo);

      await prisma.order.create({
        data: {
          userId: buyer.id,
          totalAmount: project.pricePerCredit * orderData.quantity,
          status: "COMPLETED",
          paymentMethod: orderData.daysAgo > 20 ? "credit_card" : "paypal",
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: {
              projectId: project.id,
              quantity: orderData.quantity,
              pricePerCredit: project.pricePerCredit,
            },
          },
        },
      });
    }
  }
  console.log("✅ Buyer orders created (6 orders for portfolio)");

  // Create orders from other buyers (simulated) for seller revenue
  // Using admin as another buyer for demo purposes
  const sellerOrders = [
    { sellerId: seller1.id, buyerId: admin.id, projectIndex: 0, quantity: 200, daysAgo: 60 },
    { sellerId: seller1.id, buyerId: admin.id, projectIndex: 2, quantity: 150, daysAgo: 50 },
    { sellerId: seller1.id, buyerId: admin.id, projectIndex: 4, quantity: 100, daysAgo: 40 },
    { sellerId: seller1.id, buyerId: admin.id, projectIndex: 6, quantity: 250, daysAgo: 30 },
    { sellerId: seller1.id, buyerId: admin.id, projectIndex: 9, quantity: 75, daysAgo: 20 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 1, quantity: 300, daysAgo: 55 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 3, quantity: 180, daysAgo: 45 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 5, quantity: 120, daysAgo: 35 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 7, quantity: 90, daysAgo: 25 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 8, quantity: 200, daysAgo: 15 },
    { sellerId: seller2.id, buyerId: admin.id, projectIndex: 10, quantity: 60, daysAgo: 5 },
  ];

  for (const orderData of sellerOrders) {
    const project = allProjects[orderData.projectIndex];
    if (project) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - orderData.daysAgo);

      await prisma.order.create({
        data: {
          userId: orderData.buyerId,
          totalAmount: project.pricePerCredit * orderData.quantity,
          status: "COMPLETED",
          paymentMethod: "credit_card",
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: {
              projectId: project.id,
              quantity: orderData.quantity,
              pricePerCredit: project.pricePerCredit,
            },
          },
        },
      });
    }
  }
  console.log("✅ Seller revenue orders created");

  // Update project available credits based on orders
  for (const project of allProjects) {
    const orderItems = await prisma.orderItem.findMany({
      where: { projectId: project.id },
    });
    const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    await prisma.project.update({
      where: { id: project.id },
      data: {
        availableCredits: Math.max(0, project.totalCredits - totalSold),
      },
    });
  }
  console.log("✅ Project available credits updated");

  console.log("🌱 Seed completed successfully!");
  console.log("");
  console.log("📧 Demo Accounts:");
  console.log("   Buyer:  john@example.com / password123");
  console.log("   Seller: sarah@green.org / password123");
  console.log("   Seller: mike@solarpower.com / password123");
  console.log("   Admin:  admin@carbon.market / admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
