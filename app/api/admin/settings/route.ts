import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Always return the settings, even for public unauthenticated access (like landing page)
    let settings = await SiteSettings.findOne().lean();
    
    // If no settings exist yet, create default settings
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    return Response.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Fetch site settings error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return Response.json(
        { success: false, error: 'Unauthorized — Admin access only' },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    await connectDB();

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    // Update allowable fields
    const allowedFields = ['heroTitle', 'heroSubtitle', 'aboutText', 'contactEmail', 'contactPhone'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        (settings as any)[field] = updateData[field];
      }
    });

    settings.updatedBy = user.userId as any;
    await settings.save();

    return Response.json({
      success: true,
      data: settings,
      message: 'Site settings updated successfully'
    });
  } catch (error) {
    console.error('Update site settings error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
