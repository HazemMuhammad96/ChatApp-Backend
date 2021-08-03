import joi from "joi"

export function signInValidation(data: any) {
    const schema = joi.object({
        email: joi.string().min(10).max(30).required().email(),
        password: joi.string().min(8).max(30).required()
    });

    return schema.validate(data).error;
}