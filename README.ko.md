# DragGPT

Translation Versions: [ENGLISH](./README.md) | [中文简体](./README.zh-CN.md) | [にほんご](./README.ja.md) | [한국어](./README.ko.md)

드래그 후 버튼 클릭만으로 간단하게 선택한 내용을 ChatGPT에게 물어보거나 요청할 수 있어요!

이 익스텐션은 [chrome-extension-boilerplate-react-vite](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) 로 쉽고 빠르게 개발 할 수 있었습니다.

[Install Extension](chrome.google.com/webstore/detail/draggpt-easy-start-with-d/akgdgnhlglhelinkmnmiakgccdkghjbh)


---

## Table of Contents

- [Intro](#intro)
- [Features](#features)
- [Installation](#installation)
  - [Procedures](#procedures)

## Intro <a name="intro"></a>

이 확장 프로그램은 웹 환경에서 친숙하게 여러 용도로 ChatGPT를 사용하길 원하는 유저들을 돕기 위해 만들어졌습니다.

openai API를 사용하고 있으며, 현재는 간단한 프롬프트 요청으로 어떤 동작을 할지 지시 할 수 있지만 추후 파라미터의 미세조정과 모델 선택 기능도 추가할 예정입니다.

## Features <a name="features"></a>
- 텍스트 드래그를 통해 간단하게 ChatGPT 호출
- 사전 설정한 프롬프트를 통해 원하는 응답을 받을 수 있음
- 여러개의 프롬프트 슬롯을 만들어두고 원할 때 선택해서 사용 가능
- 익스텐션 팝업창을 통해 사전 프롬프트 없이 빠른 채팅 가능
- 사전 프롬프트를 역할에 맞게 생성해주는 기능 탑재 (ex. 프롬프트 생성기에 'SNS 마케팅에 필요한 짧은 텍스트를 생성하는 프롬프트' 입력)

### TODO
- [x] 프롬프트 파라미터 미세 조정
- [x] 텍스트 모델 선택 (현재는 gpt-3.5-turbo 고정)
- [ ] 이미지 입-출력 기능 (GPT-4 대응)
- [x] 대화 내역 히스토리에서 볼 수 있는 기능 추가

## Installation <a name="installation"></a>

[설치 링크](chrome.google.com/webstore/detail/draggpt-easy-start-with-d/akgdgnhlglhelinkmnmiakgccdkghjbh)로 이동 후 설치해서 사용

### Procedures <a name="procedures"></a>

[openai api key 발급](https://platform.openai.com/account/api-keys)

---


[CONTRIBUTING](./CONTRIBUTING.md)

[LICENSE](./LICENSE)
