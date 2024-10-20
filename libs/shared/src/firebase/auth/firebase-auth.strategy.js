"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const passport_jwt_1 = require("passport-jwt");
const configs_1 = __importDefault(require("../../configs"));
const firebase_admin_1 = require("firebase-admin");
let FirebaseAuthStrategy = class FirebaseAuthStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configs_1.default.jwt.secret,
            passReqToCallback: true,
        });
    }
    async validate(req, payload) {
        var _a;
        const accessToken = req.headers['authorization'];
        const decodedToken = await (0, firebase_admin_1.auth)()
            .verifyIdToken(accessToken, true)
            .catch((err) => {
            console.error(err);
            throw new common_1.UnauthorizedException();
        });
        return {
            userId: decodedToken.sub,
            email: (_a = decodedToken.email) !== null && _a !== void 0 ? _a : payload.email,
        };
    }
};
exports.FirebaseAuthStrategy = FirebaseAuthStrategy;
exports.FirebaseAuthStrategy = FirebaseAuthStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseAuthStrategy);
//# sourceMappingURL=firebase-auth.strategy.js.map