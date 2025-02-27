const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.deleteAuthUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send({ error: "Method not allowed" });
        }

        try {
            const { uid } = req.body;
            if (!uid) {
                return res.status(400).send({ error: "Missing UID" });
            }

            await admin.auth().deleteUser(uid);
            return res.status(200).send({ message: "User deleted successfully" });

        } catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
});
