import type { ThemeConfig } from "antd";

export const AppColors  = {
    COLOR_PRIMARY : "#13c2c2",
    COLOR_SUCCESS : "#a0d911",
    COLOR_WARNING : "#faad14",
    COLOR_BG : "#d9d9d9",
    COLOR_BG_SIDER : "#0F9C9C",
    COLOR_BG_MENU_ITEMS : "#084E4E",
    COLOR_BG_DARKER : "#032020",
    COLOR_CONTAINER_BG : "rgba(19,194,194,0.02)",
    COLOR_STAR : "rgb(255,236,112)"
} as const;

export const themeConfig: ThemeConfig = {
  "token": {
    "colorPrimary": AppColors.COLOR_PRIMARY,
    "colorInfo": AppColors.COLOR_PRIMARY,
    "colorSuccess": AppColors.COLOR_SUCCESS,
    "colorWarning": AppColors.COLOR_WARNING,
  },
  "components": {
    "Layout": {
      "headerBg": AppColors.COLOR_BG_SIDER,
      "algorithm": true,
      "bodyBg": AppColors.COLOR_CONTAINER_BG,
      "siderBg": AppColors.COLOR_BG_DARKER
    },
    "Menu": {
        "subMenuItemBg" : AppColors.COLOR_BG_DARKER,
        "darkSubMenuItemBg" : AppColors.COLOR_BG_DARKER,
        "darkItemBg": AppColors.COLOR_BG_MENU_ITEMS,
    },
    "Rate": {
      "starColor": AppColors.COLOR_STAR
    }
  }
};