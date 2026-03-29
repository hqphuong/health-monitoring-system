import prisma from '../lib/prisma.js';

export const getRelatives = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ status: "error", message: "Không tìm thấy thông tin xác thực người dùng" });
        }
        const relatives = await prisma.relative.findMany({
            where: { user_id: req.user.user_id }
        });
        return res.status(200).json({ status: "success", data: relatives });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const addRelative = async (req, res) => {
    try {
        const { contact_name, phone_num, relationship } = req.body;

        if (!contact_name || !phone_num || !relationship) {
            return res.status(400).json({ status: "error", message: "Vui lòng điền đủ thông tin người thân." });
        }

        const relative = await prisma.relative.create({
            data: {
                user_id: req.user.user_id, // Lấy từ Token
                contact_name,
                phone_num,
                relationship
            }
        });

        return res.status(201).json({ status: "success", message: "Thêm người thân thành công", data: relative });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const updateRelative = async (req, res) => {
    try {
        const { id } = req.params;
        const { contact_name, phone_num, relationship } = req.body;

        // BẢO MẬT: Kiểm tra xem người thân này có đúng là của user đang đăng nhập không
        const existingRelative = await prisma.relative.findFirst({
            where: { relative_id: id, user_id: req.user.user_id }
        });

        if (!existingRelative) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy người thân hoặc bạn không có quyền sửa." });
        }

        const updatedRelative = await prisma.relative.update({
            where: { relative_id: id },
            data: { contact_name, phone_num, relationship } // PATCH cho phép field nào undefined thì nó tự bỏ qua
        });

        return res.status(200).json({ status: "success", message: "Cập nhật thành công", data: updatedRelative });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const deleteRelative = async (req, res) => {
    try {
        const { id } = req.params;

        // BẢO MẬT: Phải check quyền sở hữu trước khi xóa
        const existingRelative = await prisma.relative.findFirst({
            where: { relative_id: id, user_id: req.user.user_id }
        });

        if (!existingRelative) {
            return res.status(404).json({ status: "error", message: "Không tìm thấy người thân hoặc bạn không có quyền xóa." });
        }

        await prisma.relative.delete({
            where: { relative_id: id }
        });

        return res.status(200).json({ status: "success", message: "Đã xóa người thân thành công" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};