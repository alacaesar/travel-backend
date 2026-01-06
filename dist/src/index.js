"use strict";
// import type { Core } from '@strapi/strapi';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * An asynchronous register function that runs before
     * your application is initialized.
     *
     * This gives you an opportunity to extend code.
     */
    register( /* { strapi }: { strapi: Core.Strapi } */) { },
    /**
     * An asynchronous bootstrap function that runs before
     * your application gets started.
     *
     * This gives you an opportunity to set up your data model,
     * run jobs, or perform some special logic.
     */
    async bootstrap({ strapi }) {
        console.log('BOOTSTRAP STARTING...');
        try {
            // Check count of published journeys
            const journeyCount = await strapi.documents('api::journey.journey').count({
                status: 'published'
            });
            console.log(`Found ${journeyCount} published journeys.`);
            if (journeyCount === 0) {
                console.log('No published journeys found. Creating/Publishing data...');
                // Try to find if drafts exist to avoid unique constraint errors?
                // Actually, just try-catch each creation individually to be safe.
                try {
                    const lapland = await strapi.documents('api::journey.journey').create({
                        data: {
                            title: 'Journey to Lapland',
                            slug: 'journey-to-lapland',
                            description: 'A magical winter adventure in Finland.',
                        },
                        status: 'published'
                    });
                    console.log('Created Lapland Journey:', lapland.documentId);
                    const arusha = await strapi.documents('api::journey.journey').create({
                        data: {
                            title: 'Coffee tour in Arusha',
                            slug: 'coffee-tour-in-arusha',
                            description: 'Exploring the roots of coffee in Tanzania.',
                        },
                        status: 'published'
                    });
                    console.log('Created Arusha Journey:', arusha.documentId);
                    // Create Travel Entries
                    await strapi.documents('api::travel-entry.travel-entry').create({
                        data: {
                            title: 'Spotting starfish in Bayahibe beach',
                            slug: 'spotting-starfish-bayahibe',
                            date: '2023-11-15',
                            country: 'Dominican Republic',
                            category: 'Nature',
                            description: 'We found amazing starfish in the shallow waters of Bayahibe.',
                            journey: arusha.documentId,
                        },
                        status: 'published'
                    });
                    await strapi.documents('api::travel-entry.travel-entry').create({
                        data: {
                            title: 'Coffee tour in Arusha',
                            slug: 'coffee-tour-arusha-entry',
                            date: '2023-10-10',
                            country: 'Tanzania',
                            category: 'Food',
                            description: 'Learning how coffee is grown and roasted by locals.',
                            journey: arusha.documentId,
                        },
                        status: 'published'
                    });
                    await strapi.documents('api::travel-entry.travel-entry').create({
                        data: {
                            title: 'Northern Lights',
                            slug: 'northern-lights',
                            date: '2023-12-24',
                            country: 'Finland',
                            category: 'Adventure',
                            description: 'Witnessing the Aurora Borealis in all its glory.',
                            journey: lapland.documentId,
                        },
                        status: 'published'
                    });
                    console.log('Dummy data created and PUBLISHED successfully!');
                }
                catch (createError) {
                    console.error("Error creating data (possibly duplicate slugs):", createError.message);
                }
            }
            // Add 3 specific extra entries if they don't exist
            try {
                const extraSlugs = ['serengeti-safari', 'zanzibar-beach', 'kilimanjaro-hike'];
                const existingExtras = await strapi.documents('api::travel-entry.travel-entry').findMany({
                    filters: { slug: { $in: extraSlugs } }
                });
                const existingSlugs = existingExtras.map(e => e.slug);
                // Get Tanzania ID or fallback
                let targetCountry = await strapi.documents('api::country.country').findMany({ filters: { code: 'tz' } }).then(res => res[0]);
                if (!targetCountry) {
                    targetCountry = await strapi.documents('api::country.country').findMany().then(res => res[0]);
                }
                // Get a journey ID
                const targetJourney = await strapi.documents('api::journey.journey').findMany().then(res => res[0]);
                if (targetCountry && targetJourney) {
                    if (!existingSlugs.includes('serengeti-safari')) {
                        await strapi.documents('api::travel-entry.travel-entry').create({
                            data: {
                                title: 'Serengeti Safari',
                                slug: 'serengeti-safari',
                                date: '2024-01-15',
                                country: targetCountry.documentId,
                                category: 'Nature',
                                description: 'Witnessing the Great Migration in the vast plains of Serengeti.',
                                journey: targetJourney.documentId,
                                content: [{ type: 'paragraph', children: [{ type: 'text', text: 'The ecosystem here is incredible.' }] }]
                            },
                            status: 'published'
                        });
                        console.log("Created Serengeti entry.");
                    }
                    if (!existingSlugs.includes('zanzibar-beach')) {
                        await strapi.documents('api::travel-entry.travel-entry').create({
                            data: {
                                title: 'Zanzibar Beach Relax',
                                slug: 'zanzibar-beach',
                                date: '2024-01-20',
                                country: targetCountry.documentId,
                                category: 'Relaxed',
                                description: 'Crystal clear waters and white sands in Nungwi.',
                                journey: targetJourney.documentId,
                                content: [{ type: 'paragraph', children: [{ type: 'text', text: 'Best place to unwind after a safari.' }] }]
                            },
                            status: 'published'
                        });
                        console.log("Created Zanzibar entry.");
                    }
                    if (!existingSlugs.includes('kilimanjaro-hike')) {
                        await strapi.documents('api::travel-entry.travel-entry').create({
                            data: {
                                title: 'Kilimanjaro Hike',
                                slug: 'kilimanjaro-hike',
                                date: '2024-01-10',
                                country: targetCountry.documentId,
                                category: 'Adventure',
                                description: 'A challenging trek to the roof of Africa.',
                                journey: targetJourney.documentId,
                                content: [{ type: 'paragraph', children: [{ type: 'text', text: 'The view from the top is worth the effort.' }] }]
                            },
                            status: 'published'
                        });
                        console.log("Created Kilimanjaro entry.");
                    }
                }
                else {
                    console.log("Skipping extra entries: No country or journey found to link.");
                }
            }
            catch (err) {
                console.error("Error seeding extra entries:", err);
            }
            // Add 3 specific extra journeys and link them
            try {
                const journeyData = [
                    { title: 'Serengeti Adventure', slug: 'serengeti-adventure', description: 'Exploring the endless plains.', entrySlug: 'serengeti-safari' },
                    { title: 'Zanzibar Getaway', slug: 'zanzibar-getaway', description: 'Relaxing on the spice island.', entrySlug: 'zanzibar-beach' },
                    { title: 'Kilimanjaro Expedition', slug: 'kilimanjaro-expedition', description: 'Climbing the highest peak in Africa.', entrySlug: 'kilimanjaro-hike' }
                ];
                for (const j of journeyData) {
                    // Check if journey exists
                    let journey = await strapi.documents('api::journey.journey').findMany({ filters: { slug: j.slug } }).then(res => res[0]);
                    if (!journey) {
                        journey = await strapi.documents('api::journey.journey').create({
                            data: {
                                title: j.title,
                                slug: j.slug,
                                description: j.description,
                            },
                            status: 'published'
                        });
                        console.log(`Created Journey: ${j.title}`);
                    }
                    // Find the entry and update its journey
                    const entry = await strapi.documents('api::travel-entry.travel-entry').findMany({ filters: { slug: j.entrySlug } }).then(res => res[0]);
                    if (entry && journey) {
                        await strapi.documents('api::travel-entry.travel-entry').update({
                            documentId: entry.documentId,
                            data: {
                                journey: journey.documentId
                            },
                            status: 'published'
                        });
                        console.log(`Linked entry ${j.entrySlug} to journey ${j.slug}`);
                    }
                }
            }
            catch (err) {
                console.error("Error seeding extra journeys:", err);
            }
        }
        catch (e) {
            console.error('BOOTSTRAP ERROR:', e);
        }
        // Grant Public Permissions Programmatically
        try {
            const publicRole = await strapi
                .documents("plugin::users-permissions.role")
                .findFirst({
                where: { type: "public" },
            });
            if (publicRole) {
                const permissionsToEnable = [
                    "api::journey.journey.find",
                    "api::journey.journey.findOne",
                    "api::travel-entry.travel-entry.find",
                    "api::travel-entry.travel-entry.findOne",
                ];
                // This is a bit complex in v5, simpler to just logging instructions if this fails, 
                // but let's try to update the permissions if possible.
                // Actually, in Strapi 5 direct permission manipulation can be tricky without the service.
                // A safer bet is to use the service if available, or just rely on the user.
                // BUT, I want to fix it for them.
                // Let's print a BIG FAT WARNING if we can't do it, but let's try to just use the Service API if possible.
                // However, updating permissions programmatically involves updating the `up_permissions` table.
                // Alternative: Just log the reminder clearly.
                // But the user asked "I don't see articles".
                // Let's try to find existing permissions and create them if missing.
                // The permission service is 'plugin::users-permissions.permission'.
                for (const action of permissionsToEnable) {
                    const existing = await strapi.documents('plugin::users-permissions.permission').findFirst({
                        where: {
                            action,
                            role: publicRole.documentId
                        }
                    });
                    if (!existing) {
                        console.log(`Enabling public permission: ${action}`);
                        await strapi.documents('plugin::users-permissions.permission').create({
                            data: {
                                action,
                                role: publicRole.documentId
                            }
                        });
                    }
                }
                console.log("Public permissions verified/enabled.");
            }
        }
        catch (error) {
            console.error("Error setting permissions:", error);
        }
    },
};
