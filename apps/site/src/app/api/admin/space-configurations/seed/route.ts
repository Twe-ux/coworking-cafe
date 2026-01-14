import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import SpaceConfiguration from "@/models/spaceConfiguration";

const defaultHours = {
  monday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  tuesday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  wednesday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  thursday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  friday: { isOpen: true, openTime: "09:00", closeTime: "20:00" },
  saturday: { isOpen: true, openTime: "10:00", closeTime: "20:00" },
  sunday: { isOpen: true, openTime: "10:00", closeTime: "20:00" },
};

const seedData = [
  {
    spaceType: "open-space",
    name: "Place Open-space",
    slug: "open-space",
    description: "Un espace ouvert et collaboratif",
    pricing: {
      hourly: 15,
      daily: 80,
      weekly: 350,
      monthly: 1200,
      perPerson: true,
    },
    availableReservationTypes: {
      hourly: true,
      daily: true,
      weekly: true,
      monthly: true,
    },
    requiresQuote: false,
    minCapacity: 1,
    maxCapacity: 50,
    defaultHours,
    exceptionalClosures: [],
    isActive: true,
    imageUrl: "/images/open-space.jpg",
    displayOrder: 1,
  },
  {
    spaceType: "salle-verriere",
    name: "Salle Verrière",
    slug: "salle-verriere",
    description: "Une salle lumineuse avec vue",
    pricing: {
      hourly: 25,
      daily: 150,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: true,
      daily: true,
      weekly: false,
      monthly: false,
    },
    requiresQuote: false,
    minCapacity: 2,
    maxCapacity: 12,
    defaultHours,
    exceptionalClosures: [],
    isActive: true,
    imageUrl: "/images/salle-verriere.jpg",
    displayOrder: 2,
  },
  {
    spaceType: "salle-etage",
    name: "Salle Étage",
    slug: "salle-etage",
    description: "Une salle privée à l'étage",
    pricing: {
      hourly: 30,
      daily: 180,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: true,
      daily: true,
      weekly: false,
      monthly: false,
    },
    requiresQuote: false,
    minCapacity: 2,
    maxCapacity: 8,
    defaultHours,
    exceptionalClosures: [],
    isActive: true,
    imageUrl: "/images/salle-etage.jpg",
    displayOrder: 3,
  },
  {
    spaceType: "evenementiel",
    name: "Espace Événementiel",
    slug: "evenementiel",
    description: "Un grand espace pour vos événements - Tarifs sur devis",
    pricing: {
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      perPerson: false,
    },
    availableReservationTypes: {
      hourly: false,
      daily: false,
      weekly: false,
      monthly: false,
    },
    requiresQuote: true,
    minCapacity: 10,
    maxCapacity: 80,
    defaultHours,
    exceptionalClosures: [],
    isActive: true,
    imageUrl: "/images/evenementiel.jpg",
    displayOrder: 4,
  },
];

/**
 * POST /api/admin/space-configurations/seed
 * Initialize default space configurations
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if configurations already exist
    const existingCount = await SpaceConfiguration.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json(
        {
          error: "Configurations already exist. Delete them first if you want to re-seed.",
        },
        { status: 400 }
      );
    }

    // Create all configurations
    const configurations = await SpaceConfiguration.insertMany(seedData);

    return NextResponse.json(
      {
        success: true,
        message: `${configurations.length} space configurations created`,
        data: configurations,
      },
      { status: 201 }
    );
  } catch (error) {    return NextResponse.json(
      { error: "Failed to seed configurations" },
      { status: 500 }
    );
  }
}
