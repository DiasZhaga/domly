package models

import "diplom/internal/common"

type RegisterResponse struct {
	code      string
	messageRu string
	messageKz string
}

func (r *RegisterResponse) ErrorEmpty() {
	r.code = common.ErrorCode
	r.messageRu = common.EmptyErrorMessage
	r.messageKz = common.EmptyErrorMessageKz
}

func (r *RegisterResponse) ErrorMatch() {
	r.code = common.ErrorCode
	r.messageRu = common.MatchErrorMessage
	r.messageKz = common.MatchErrorMessageKz
}

func (r *RegisterResponse) ErrorLen() {
	r.code = common.ErrorCode
	r.messageRu = common.LenErrorMessage
	r.messageKz = common.LenErrorMessageKz
}

func (r *RegisterResponse) ErrorLatin() {
	r.code = common.ErrorCode
	r.messageRu = common.LatinErrorMessage
	r.messageKz = common.LatinErrorMessageKz
}

func (r *RegisterResponse) ErrLogin(kind string) {
	switch kind {
	case common.TypeEmail:
		r.code = common.ErrorCode
		r.messageRu = common.EmailErrorMessage
		r.messageKz = common.EmailErrorMessageKz
	case common.TypePhone:
		r.code = common.ErrorCode
		r.messageRu = common.PhoneErrorMessage
		r.messageKz = common.PhoneErrorMessageKz
	}
}

func (r *RegisterResponse) ErrorMatchLogin() {
	r.code = common.ErrorCode
	r.messageRu = common.MatchLoginErrorMessage
	r.messageKz = common.MatchLoginErrorMessageKz
}

func (r *RegisterResponse) Error() {
	r.code = common.ErrorCode
	r.messageRu = common.ErrorMessage
	r.messageKz = common.ErrorMessageKz
}

func (r *RegisterResponse) Successfully() {
	r.code = common.SuccessCode
	r.messageRu = common.DoneMessage
	r.messageKz = common.DoneMessageKz
}
