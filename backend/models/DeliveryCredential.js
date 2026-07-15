const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const deliveryCredentialSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
    },
    phone: {
      type:      String,
      required:  [true, "Phone number is required"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: [true, "Password is required"],
      select:   false,
    },
    isSleeping: {
      type:     Boolean,
      default:  false,
    },
    isActive: {
      type:     Boolean,
      default:  true,
    },
  },
  { timestamps: true }
);

// Hash the password before saving
deliveryCredentialSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
deliveryCredentialSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("DeliveryCredential", deliveryCredentialSchema);
