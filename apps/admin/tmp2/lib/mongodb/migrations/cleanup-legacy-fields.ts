// Script de nettoyage pour supprimer les champs legacy tel et active
import dbConnect from "@/lib/mongodb/dbConnect";
import Staff from "@/lib/mongodb/models/Staff";

export async function cleanupLegacyFields() {
  await dbConnect();

  console.log("🧹 Début du nettoyage des champs legacy...");

  try {
    // Supprimer les champs legacy tel et active de tous les documents
    const result = await Staff.updateMany(
      {},
      {
        $unset: {
          tel: "", // Supprimer le champ tel
          active: "", // Supprimer le champ active
        },
      },
    );

    console.log(
      `✅ Nettoyage terminé ! ${result.modifiedCount} documents nettoyés.`,
    );

    // Vérifier qu'il ne reste plus de champs legacy
    const verification = await Staff.findOne({
      $or: [{ tel: { $exists: true } }, { active: { $exists: true } }],
    });

    if (verification) {
      console.warn("⚠️ Il reste encore des documents avec des champs legacy");
      return {
        success: false,
        message: "Certains documents ont encore des champs legacy",
        modifiedCount: result.modifiedCount,
      };
    }

    return {
      success: true,
      message: `Nettoyage réussi: ${result.modifiedCount} documents nettoyés, plus aucun champ legacy`,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      error,
    };
  }
}

// Fonction pour vérifier l'état actuel des champs
export async function checkFieldsStatus() {
  await dbConnect();

  try {
    const total = await Staff.countDocuments({});
    const withLegacyTel = await Staff.countDocuments({
      tel: { $exists: true },
    });
    const withLegacyActive = await Staff.countDocuments({
      active: { $exists: true },
    });
    const withModernPhone = await Staff.countDocuments({
      phone: { $exists: true },
    });
    const withModernIsActive = await Staff.countDocuments({
      isActive: { $exists: true },
    });

    return {
      success: true,
      stats: {
        total,
        legacy: {
          tel: withLegacyTel,
          active: withLegacyActive,
        },
        modern: {
          phone: withModernPhone,
          isActive: withModernIsActive,
        },
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      error,
    };
  }
}
