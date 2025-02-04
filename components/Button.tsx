import React, {forwardRef, ElementType, Ref} from 'react';
import classNames from 'classnames';

interface ButtonProps {
    outline?: boolean;
    block?: boolean;
    link?: boolean;
    icon?: boolean;
    active?: boolean;
    className?: string;
    disabled?: boolean;
    href?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    type?: 'button' | 'reset' | 'submit';
    onClick?: () => void;
    style?: React.CSSProperties;

    [key: string]: any;
}

const useButtonProps = ({disabled, href, target, onClick, type}: ButtonProps) => {
    const tagName: ElementType = href ? 'a' : 'button';
    const meta = {tagName};

    if (tagName === 'button') {
        return [{type: type || 'button', disabled}, meta] as const;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (onClick) {
            onClick();
        }
    };

    if (disabled) {
        href = undefined;
    }

    return [{href, target, onClick: handleClick}, meta] as const;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
                                                               outline = false,
                                                               block = false,
                                                               link = false,
                                                               icon = false,
                                                               disabled = false,
                                                               active = false,
                                                               className,
                                                               style,
                                                               onClick,
                                                               ...props
                                                           }, ref) => {
    const [buttonProps, {tagName: Component}] = useButtonProps({disabled, ...props});

    return (
        <Component
            {...props}
            {...buttonProps}
            ref={ref as Ref<any>}
            className={classNames(
                (!icon && !link) && 'btn',
                icon && 'btn_icon',
                link && 'btn_link',
                outline && 'btn_outline',
                block && 'btn_block',
                className,
                active && 'active',
                props.href && disabled && 'disabled',
            )}
            onClick={onClick}
            style={style}
        />
    );
});

Button.displayName = 'Button';

export default Button;
