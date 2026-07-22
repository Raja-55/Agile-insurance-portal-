const Purchase = require("../Models/purchase.model");
const Payment = require("../Models/payment.model");
const Policy = require("../Models/policy.model");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");

/**
 * Create a new policy purchase with simulated payment success
 */
const createPurchase = catchAsync(async (req, res, next) => {
    const { policyId, paymentMethod, nominee, billingCycle = "monthly" } = req.body;

    if (!policyId) {
        return next(new AppError("Policy ID is required", 400));
    }

    if (!nominee || !nominee.fullName || !nominee.relation || !nominee.phone || !nominee.dob) {
        return next(new AppError("Complete nominee details (fullName, relation, phone, dob) are required", 400));
    }

    // Find the policy (supporting both MongoDB ObjectIds and static catalog IDs)
    let policy;
    const isMongoId = /^[a-f\d]{24}$/i.test(policyId);

    if (isMongoId) {
        policy = await Policy.findById(policyId);
    } else {
        const { policyDetails } = req.body;
        if (!policyDetails) {
            return next(new AppError("Policy details are required for static plans", 400));
        }

        // Try to find if the policy was already created to prevent duplicates
        policy = await Policy.findOne({
            companyName: policyDetails.companyName,
            policyName: policyDetails.policyName,
        });

        if (!policy) {
            const Admin = require("../Models/admin.model");
            const defaultAdmin = await Admin.findOne();
            if (!defaultAdmin) {
                return next(new AppError("No admin account found to assign the policy to", 500));
            }

            let category = (policyDetails.category || "health").toLowerCase();
            if (category.includes("health")) category = "health";
            else if (category.includes("term")) category = "term";
            else if (category.includes("car") || category.includes("auto") || category.includes("vehicle")) category = "auto";
            else if (category.includes("life")) category = "life";
            else if (category.includes("travel")) category = "travel";
            else if (category.includes("business")) category = "business";
            else if (category.includes("home")) category = "home";
            else category = "health";

            const rand1 = Math.floor(100000 + Math.random() * 900000);
            const rand2 = Math.floor(1000 + Math.random() * 9000);
            const policy_number = `AGL-${rand1}-${rand2}`;

            policy = await Policy.create({
                admin: defaultAdmin._id,
                companyName: policyDetails.companyName,
                policyName: policyDetails.policyName,
                policy_number,
                premium_amount: Number(policyDetails.premiumAmount),
                premiumAmount: Number(policyDetails.premiumAmount),
                coverage_amount: Number(policyDetails.coverageAmount),
                coverageAmount: Number(policyDetails.coverageAmount),
                category,
                policyType: policyDetails.policyType || "Standard",
                policy_type: policyDetails.policyType || "Standard",
                description: policyDetails.description || "Auto-seeded static policy",
                policy_desc: policyDetails.description || "Auto-seeded static policy",
                features: policyDetails.features || [],
                emiAvailable: !!policyDetails.emiAvailable,
                validityYears: Number(policyDetails.validityYears || 1),
                rating: Number(policyDetails.rating || 4.5),
                claimRatio: Number(policyDetails.claimRatio || 95),
                isActive: true,
                status: "active",
            });
        }
    }

    if (!policy) {
        return next(new AppError("Policy not found", 404));
    }

    // Support both snake_case and camelCase field names (existing DB docs use camelCase)
    const basePremium = policy.premium_amount || policy.premiumAmount || policy.monthlyPremium || 0;
    if (basePremium <= 0) {
        return next(new AppError("Invalid policy premium amount", 400));
    }

    // Calculations
    const amount = billingCycle === "yearly" ? Math.round(basePremium * 12 * 0.92) : basePremium;
    const tax_amount = Math.round(amount * 0.18);
    const final_amount = amount + tax_amount;

    const today = new Date();
    const end = new Date(today);
    let remaining_months = 1;

    if (billingCycle === "yearly") {
        end.setFullYear(end.getFullYear() + 1);
        remaining_months = 12;
    } else {
        end.setMonth(end.getMonth() + 1);
        remaining_months = 1;
    }

    // 1. Generate ID values
    const randTxn = Math.random().toString(36).substring(2, 10).toUpperCase();
    const randInv = Math.random().toString(36).substring(2, 10).toUpperCase();
    const transaction_id = `TXN-${randTxn}-${today.getTime().toString().slice(-4)}`;
    const invoice_number = `INV-${randInv}-${today.getTime().toString().slice(-4)}`;

    // 2. Instantiate Purchase Model
    const purchase = new Purchase({
        user: req.user._id,
        policy: policy._id,
        nominee: {
            fullName: nominee.fullName,
            relation: nominee.relation,
            phone: nominee.phone,
            dob: new Date(nominee.dob),
        },
        purchase_date: today,
        start_date: today,
        end_date: end,
        remaining_months,
        purchase_status: "active",
        payment_status: "paid",
    });

    // 3. Instantiate Payment Model
    const payment = new Payment({
        purchase: purchase._id,
        user: req.user._id,
        policy: policy._id,
        transaction_id,
        invoice_number,
        amount,
        tax_amount,
        final_amount,
        payment_method: paymentMethod || "upi",
        payment_provider: "agile-pay",
        payment_status: "success",
        paid_at: today,
    });

    // 4. Link payment to purchase
    purchase.payment = payment._id;

    // 5. Save both documents
    await Promise.all([purchase.save(), payment.save()]);

    // 6. Send Response
    res.status(201).json({
        success: true,
        message: "Policy purchased successfully",
        purchaseNumber: purchase.purchase_number,
    });
});

/**
 * Get policies purchased by the authenticated user
 */
const getMyPolicies = catchAsync(async (req, res, next) => {
    const purchases = await Purchase.find({ user: req.user._id })
        .populate("policy")
        .populate("payment")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: purchases,
    });
});

/**
 * Get all purchases for admin dashboard
 */
const getAllPurchases = catchAsync(async (req, res, next) => {
    const purchases = await Purchase.find()
        .populate("user", "fullName email phone role")
        .populate("policy")
        .populate("payment")
        .sort({ createdAt: -1 });

    // Calculate statistics
    const totalPurchases = purchases.length;

    // Total Revenue: sum of final_amount of successful payments
    const totalRevenue = purchases.reduce((sum, item) => {
        if (item.payment && item.payment.payment_status === "success") {
            return sum + (item.payment.final_amount || 0);
        }
        return sum;
    }, 0);

    const recentPurchases = purchases.slice(0, 10);

    res.status(200).json({
        success: true,
        data: {
            purchases,
            stats: {
                totalPurchases,
                totalRevenue,
                recentPurchases,
            },
        },
    });
});

module.exports = {
    createPurchase,
    getMyPolicies,
    getAllPurchases,
<<<<<<< HEAD
};
=======
};
>>>>>>> raj
