export function validateBicycle(data) {
    const errors = {};

    if (!data.brand || data.brand.trim().length < 3) {
        errors.brand = "La marca debe tener al menos 3 caracteres";
    } else if (data.brand.length > 40) {
        errors.brand = "La marca debe tener máximo 40 caracteres";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóú0-9\s]+$/.test(data.brand)) {
        errors.brand = "La marca solo puede contener letras, números y espacios";
    }

    if (!data.model || data.model.trim().length < 3) {
        errors.model = "El modelo debe tener al menos 3 caracteres";
    } else if (data.model.length > 40) {
        errors.model = "El modelo debe tener máximo 40 caracteres";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóú0-9\s]+$/.test(data.model)) {
        errors.model = "El modelo solo puede contener letras, números y espacios";
    }

    if (!data.color || data.color.trim().length < 3) {
        errors.color = "El color debe tener al menos 3 caracteres";
    } else if (data.color.length > 40) {
        errors.color = "El color debe tener máximo 40 caracteres";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóú\s]+$/.test(data.color)) {
        errors.color = "El color solo puede contener letras y espacios";
    }

    if (!data.serialNumber) {
        errors.serialNumber = "El número de serie es obligatorio";
    } else if (!/^\d{1,6}$/.test(data.serialNumber)) {
        errors.serialNumber = "El número de serie debe ser numérico (máx. 6 dígitos)";
    }

    return errors;
}