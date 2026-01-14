// Migration script pour synchroniser les champs legacy avec les nouveaux champs modernes
import dbConnect from "@/lib/mongodb/dbConnect";
import Staff from "@/lib/mongodb/models/Staff";

export async function migrateStaffFields() {
  await dbConnect();

  console.log("🔄 Début de la migration des champs Staff...");

  try {
    // Récupérer tous les documents staff
    const allStaff = await Staff.find({});

    console.log(`📊 ${allStaff.length} membres du staff trouvés`);

    let updateCount = 0;

    for (const staff of allStaff) {
      const updates: any = {};

      // Synchroniser tel → phone si phone n'existe pas
      if (staff.tel && !staff.phone) {
        updates.phone = staff.tel;
      }

      // Synchroniser active → isActive si isActive n'existe pas
      if (staff.active !== undefined && staff.isActive === undefined) {
        updates.isActive = staff.active;
      }

      // Appliquer les mises à jour si nécessaire
      if (Object.keys(updates).length > 0) {
        await Staff.findByIdAndUpdate(staff._id, updates);
        updateCount++;
        console.log(
          `✅ Mis à jour ${staff.firstName} ${staff.lastName}:`,
          updates,
        );
      }
    }

    console.log(`🎉 Migration terminée ! ${updateCount} documents mis à jour.`);

    return {
      success: true,
      message: `Migration réussie: ${updateCount}/${allStaff.length} documents mis à jour`,
      updated: updateCount,
      total: allStaff.length,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      error,
    };
  }
}

// Fonction pour synchroniser dans les deux sens (legacy ↔ moderne)
export async function syncStaffFields() {
  await dbConnect();

  try {
    // Synchroniser phone → tel et isActive → active pour la compatibilité
    const result = await Staff.updateMany({}, [
      {
        $set: {
          tel: { $ifNull: ["$tel", "$phone"] },
          phone: { $ifNull: ["$phone", "$tel"] },
          active: { $ifNull: ["$active", "$isActive"] },
          isActive: { $ifNull: ["$isActive", "$active"] },
        },
      },
    ]);

    console.log(
      `🔄 Synchronisation bidirectionnelle: ${result.modifiedCount} documents mis à jour`,
    );

    return {
      success: true,
      message: `Synchronisation réussie: ${result.modifiedCount} documents`,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      error,
    };
  }
}
