import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Parse query parameters
        const province = searchParams.get("province");
        const city = searchParams.get("city");
        const search = searchParams.get("search");
        const indigenous = searchParams.get("indigenous") === "true";
        const licensed = searchParams.get("licensed") === "true";
        const minRating = searchParams.get("minRating") 
            ? parseFloat(searchParams.get("minRating")!) 
            : undefined;
        const limit = searchParams.get("limit") 
            ? parseInt(searchParams.get("limit")!) 
            : 50;
        const page = searchParams.get("page") 
            ? parseInt(searchParams.get("page")!) 
            : 1;

        // Build where clause
        const where: any = {};

        if (province) {
            where.province = province.toUpperCase();
        }

        if (city) {
            where.city = {
                contains: city,
                mode: "insensitive",
            };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        if (indigenous) {
            where.isIndigenousOwned = true;
        }

        if (licensed) {
            where.isLicensed = true;
        }

        if (minRating) {
            where.averageRating = {
                gte: minRating,
            };
        }

        // Fetch dispensaries
        const [dispensaries, total] = await Promise.all([
            prisma.dispensary.findMany({
                where,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    hours: true,
                    _count: {
                        select: {
                            reviews: true,
                            products: true,
                        },
                    },
                },
                orderBy: [
                    { dataQualityScore: "desc" },
                    { averageRating: "desc" },
                ],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.dispensary.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: dispensaries,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching dispensaries:", error);
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to fetch dispensaries" 
            },
            { status: 500 }
        );
    }
}

// POST /api/dispensaries - Create new dispensary (admin only)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validate required fields
        if (!body.name || !body.address || !body.city || !body.province) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Missing required fields: name, address, city, province" 
                },
                { status: 400 }
            );
        }

        // Generate slug
        const slug = body.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            + "-" 
            + body.city.toLowerCase().replace(/\s+/g, "-");

        const dispensary = await prisma.dispensary.create({
            data: {
                ...body,
                slug,
            },
        });

        return NextResponse.json({
            success: true,
            data: dispensary,
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating dispensary:", error);
        return NextResponse.json(
            { 
                success: false, 
                error: "Failed to create dispensary" 
            },
            { status: 500 }
        );
    }
}
