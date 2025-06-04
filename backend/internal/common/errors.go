package common

import "errors"

var (
	EmptyDataError = errors.New("not all data is filled in")
	LenDescError   = errors.New("len of description is invalid")
	LenTitleError  = errors.New("len of title is invalid")
	NotEnoughMoney = errors.New("not enough money")
)
