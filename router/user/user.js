import userService from "../../services/user/user.js";
import { Router } from "express";

const router = Router()

router.get("/users/name", (req, res, next) => {
    const name = req.query.name;

    try {
        const isExists = userService.findUserByName(name)
        if (isExists) {
            res.status(200).json({ message: "이름이 있습니다." });
        } else {
			res.status(404).json({ message: "이름이 없습니다." });
		}
    } catch (error) {
		next(error);
	}
});

router.post("/users/phone-number", (req, res, next) => {
	const { name, phoneNumber } = req.body

	try {
		const userData = userService.checkUserPhoneNumber(name, phoneNumber)
		res.status(200).json({
			isMatched: true,
			userData: userData,
		});
	} catch (error) {
		next(error)
	}
});


router.get("/users/:id", (req, res, next) => {
	const id = req.params.id
	
	try {
		const data = userService.findUser(id)
		res.status(200).json({ data: data })
	} catch (error) {
		next(error)
	}
});

router.post("/users", (req, res, next) => {
	const newUser = req.body;

	try {
		const data = userService.createUser(newUser)
		res.status(201).json({ data: data })
	} catch (error) {
		next(error)
	}
});

router.get("/users", (req, res, next) => {
	try {
		const datas = userService.findUsers()
		res.status(200).json({ data: datas })
	} catch (error) {
		next(error)
	}
});

router.put("/users", (req, res, next) => {
	const newModel = req.body
	const id = newModel.id		// 추후에 params에서 가져오도록 수정 필요

	try {
		const updated = userService.updateUser(id, newModel)
		res.status(200).json(updated)
	} catch (error) {
		next(error)
	}
});

router.delete("/users", (req, res, next) => {
	const id = req.body.id		// 추후에 params에서 가져오도록 수정 필요

	try {
		const deleted = userService.deleteUser(id)
		res.status(200).json(deleted)
	} catch (error) {
		next(error)
	}
});
